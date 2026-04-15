const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    fullName: { type: String },
    bio: { type: String },
    profilePicture: { type: String },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    // Analytics Data
    engagementRate: { type: Number, default: 0 },
    avgLikes: { type: Number, default: 0 },
    avgComments: { type: Number, default: 0 },
    topPosts: [
      {
        shortcode: String,
        likes: Number,
        comments: Number,
        thumbnailUrl: String,
        timestamp: Date,
        engagementRate: Number,
      },
    ],

    // Demographics (Estimated)
    demographics: {
      gender: { male: Number, female: Number },
      ageGroups: { type: Map, of: Number }, // e.g., "18-24": 40
      topLocations: { type: Map, of: Number }, // e.g., "New York": 10
      languages: { type: Map, of: Number }, // e.g., "English": 80
    },

    // Estimates
    fakeFollowersPercentage: { type: Number, default: 0 },
    audienceQualityScore: { type: Number, default: 0 },
    influencerScore: { type: Number, default: 0 },

    // Content Analytics
    mostUsedHashtags: [{ tag: String, count: Number }],
    postingFrequency: { type: String, default: "Unknown" }, // e.g., "2 posts/week"
    bestPostingTime: { type: String, default: "Unknown" }, // e.g., "18:00 UTC"

    lastScraped: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Profile", profileSchema);
