const Profile = require("../models/Profile");
const History = require("../models/History");

const calculateEngagement = (posts, followersCount) => {
  if (!posts || posts.length === 0 || followersCount === 0) {
    return { avgLikes: 0, avgComments: 0, engagementRate: 0, topPosts: [] };
  }

  let totalLikes = 0;
  let totalComments = 0;

  const topPosts = posts
    .map((post) => {
      totalLikes += post.likes;
      totalComments += post.comments;
      const rate = ((post.likes + post.comments) / followersCount) * 100;
      return { ...post, engagementRate: rate };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5); // top 5 posts

  const avgLikes = Math.round(totalLikes / posts.length);
  const avgComments = Math.round(totalComments / posts.length);
  const engagementRate = Number(
    (((avgLikes + avgComments) / followersCount) * 100).toFixed(2),
  );

  return { avgLikes, avgComments, engagementRate, topPosts };
};

const getEstimatedDemographics = (profileData) => {
  // Uses simple heuristics based on content/bio/profile or random distribution
  // as actual demographic data is private and only available via Instagram Insigts API.

  // Heuristic example: if bio contains certain keywords, adjust distribution.
  // We use fixed realistic estimates for MVP.
  return {
    gender: { male: 48, female: 52 },
    ageGroups: { "13-17": 5, "18-24": 35, "25-34": 40, "35-44": 15, "45+": 5 },
    topLocations: {
      "United States": 25,
      India: 20,
      Brazil: 10,
      "United Kingdom": 5,
    },
    languages: { English: 60, Spanish: 15, Portuguese: 10 },
  };
};

const calculateEstimates = (profileData, engagementMetrics) => {
  const { followersCount, followingCount, postsCount, profilePicture } =
    profileData;
  const { engagementRate } = engagementMetrics;

  let fakeFollowersPercentage = 5; // base 5%

  // Heuristic 1: Low engagement
  if (engagementRate < 0.5) fakeFollowersPercentage += 25;
  else if (engagementRate < 1) fakeFollowersPercentage += 15;

  // Heuristic 2: Following more than followers
  if (followingCount > followersCount * 2) fakeFollowersPercentage += 30;

  // Heuristic 3: No profile picture
  if (!profilePicture || profilePicture.includes("default"))
    fakeFollowersPercentage += 15;

  fakeFollowersPercentage = Math.min(fakeFollowersPercentage, 85); // Cap at 85%

  const audienceQualityScore = Math.max(10, 100 - fakeFollowersPercentage);
  const influencerScore = Math.min(
    100,
    Math.round(
      engagementRate * 10 + followersCount / 10000 + audienceQualityScore / 3,
    ),
  );

  return {
    fakeFollowersPercentage: Number(fakeFollowersPercentage.toFixed(1)),
    audienceQualityScore: Number(audienceQualityScore.toFixed(1)),
    influencerScore,
  };
};

const processAnalytics = async (scrapedData) => {
  const metrics = calculateEngagement(
    scrapedData.recentPosts || [],
    scrapedData.followersCount,
  );
  const estimates = calculateEstimates(scrapedData, metrics);
  const demographics = getEstimatedDemographics(scrapedData);

  // Hashtags & Content
  const hashtagCounts = {};
  if (scrapedData.recentPosts) {
    scrapedData.recentPosts.forEach((post) => {
      const tags = post.caption?.match(/#[\w]+/g) || [];
      tags.forEach((tag) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });
  }
  const mostUsedHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Build the complete profile doc
  const updatePayload = {
    ...scrapedData,
    ...metrics,
    ...estimates,
    demographics,
    mostUsedHashtags,
  };

  // Upsert profile
  const profile = await Profile.findOneAndUpdate(
    { username: scrapedData.username },
    { $set: updatePayload },
    { new: true, upsert: true },
  );

  // Store snapshot for history checking
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await History.findOneAndUpdate(
    { profileId: profile._id, date: today },
    {
      $set: {
        username: profile.username,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
        postsCount: profile.postsCount,
        engagementRate: profile.engagementRate,
      },
    },
    { new: true, upsert: true },
  );

  return profile;
};

const getGrowthPrediction = async (profileId) => {
  const history = await History.find({ profileId }).sort({ date: 1 }).limit(30);

  if (history.length < 2) {
    return { projectedWeeklyGrowth: 0, confidence: "Low (Insufficient data)" };
  }

  // Simple linear regression to find out slope (followers/day)
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  const n = history.length;

  history.forEach((h, i) => {
    sumX += i;
    sumY += h.followersCount;
    sumXY += i * h.followersCount;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const projectedWeeklyGrowth = Math.round(slope * 7);

  return {
    projectedWeeklyGrowth,
    confidence: n > 14 ? "High" : "Medium",
  };
};

module.exports = {
  processAnalytics,
  getGrowthPrediction,
};
