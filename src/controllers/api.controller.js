const Profile = require("../models/Profile");
const History = require("../models/History");
const instagramScraper = require("../scrapers/instagram.scraper");
const analyticsService = require("../services/analytics.service");
const logger = require("../utils/logger");

// ─── Validation ────────────────────────────────────────────────────────────────
const validateUsername = (username) => {
  if (!username || typeof username !== "string") {
    throw new Error("Username is required and must be a string");
  }
  if (username.length < 1 || username.length > 30) {
    throw new Error("Username must be between 1 and 30 characters");
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    throw new Error("Username contains invalid characters");
  }
  return username.toLowerCase();
};

// ─── Core Logic ────────────────────────────────────────────────────────────────
/**
 * Retrieve or update profile data with caching
 * @param {string} username - Instagram username
 * @returns {object} Profile data
 */
const getOrUpdateProfile = async (username) => {
  const validatedUsername = validateUsername(username);
  
  // Try to find recent cached data (scraped within 24 hours)
  const cachedProfile = await Profile.findOne({ username: validatedUsername });
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (
    cachedProfile &&
    Date.now() - cachedProfile.lastScraped < twentyFourHours
  ) {
    logger.info(`Cache hit for @${validatedUsername}`);
    return cachedProfile;
  }

  // Scrape and process new data
  logger.info(`Scraping profile @${validatedUsername}...`);
  const scrapedData = await instagramScraper.scrapeInstagramProfile(validatedUsername);
  const profile = await analyticsService.processAnalytics(scrapedData);
  
  logger.info(`Successfully processed @${validatedUsername}`);
  return profile;
};

// ─── Controller Functions ──────────────────────────────────────────────────────
/**
 * Get basic profile information
 */
exports.getProfileBasic = async (req, res) => {
  try {
    const profile = await getOrUpdateProfile(req.params.username);
    res.json({
      success: true,
      data: {
        username: profile.username,
        fullName: profile.fullName,
        bio: profile.bio,
        profilePicture: profile.profilePicture,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
        postsCount: profile.postsCount,
        isVerified: profile.isVerified,
        lastScraped: profile.lastScraped,
      },
    });
  } catch (error) {
    logger.error("Error in getProfileBasic", error);
    res.status(error.message.includes("private") ? 403 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get engagement metrics
 */
exports.getEngagement = async (req, res) => {
  try {
    const profile = await getOrUpdateProfile(req.params.username);
    res.json({
      success: true,
      data: {
        engagementRate: profile.engagementRate,
        avgLikes: profile.avgLikes,
        avgComments: profile.avgComments,
      },
    });
  } catch (error) {
    logger.error("Error in getEngagement", error);
    res.status(error.message.includes("private") ? 403 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get top posts
 */
exports.getPosts = async (req, res) => {
  try {
    const profile = await getOrUpdateProfile(req.params.username);
    res.json({
      success: true,
      data: {
        topPosts: profile.topPosts,
        postCount: profile.topPosts?.length || 0,
      },
    });
  } catch (error) {
    logger.error("Error in getPosts", error);
    res.status(error.message.includes("private") ? 403 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get full analytics with growth prediction
 */
exports.getFullAnalytics = async (req, res) => {
  try {
    const profile = await getOrUpdateProfile(req.params.username);
    const growthPrediction = await analyticsService.getGrowthPrediction(
      profile._id,
    );

    res.json({
      success: true,
      data: {
        profile,
        growthPrediction,
      },
    });
  } catch (error) {
    logger.error("Error in getFullAnalytics", error);
    res.status(error.message.includes("private") ? 403 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get follower history
 */
exports.getHistory = async (req, res) => {
  try {
    const validatedUsername = validateUsername(req.params.username);
    const profile = await Profile.findOne({ username: validatedUsername });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found in database. Fetch basic profile first.",
      });
    }

    const history = await History.find({ profileId: profile._id }).sort({
      date: 1,
    });
    
    res.json({
      success: true,
      data: {
        username: profile.username,
        history,
        dataPoints: history.length,
      },
    });
  } catch (error) {
    logger.error("Error in getHistory", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
