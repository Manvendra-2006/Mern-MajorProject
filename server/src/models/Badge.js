const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
      default: 'Award',
    },
    category: {
      type: String,
      default: 'General',
    },
    criteria: {
      type: {
        type: String,
        enum: ['CHALLENGE_COUNT', 'QUIZ_COUNT', 'CATEGORY_CHALLENGE', 'TOTAL_POINTS'],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Badge', badgeSchema);
