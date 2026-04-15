const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    username: { type: String, required: true },
    date: { type: Date, required: true },

    // Snapshotted Metrics
    followersCount: { type: Number, required: true },
    followingCount: { type: Number, required: true },
    postsCount: { type: Number, required: true },
    engagementRate: { type: Number, required: true },
  },
  { timestamps: true },
);

// Ensure one snapshot per profile per day
historySchema.index({ profileId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("History", historySchema);
