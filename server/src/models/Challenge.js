const mongoose = require('mongoose');

const challengeCategories = [
  'Waste Management',
  'Water Conservation',
  'Energy Saving',
  'Tree Plantation',
  'Biodiversity',
  'Sustainable Transportation',
  'Plastic Reduction',
  'Climate Awareness',
];

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: 150,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: challengeCategories,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    pointsReward: {
      type: Number,
      required: true,
      min: 5,
      max: 1000,
      default: 50,
    },
    xpReward: {
      type: Number,
      required: true,
      min: 5,
      max: 1000,
      default: 50,
    },
    instructions: {
      type: String,
      required: [true, 'Instructions are required'],
      maxlength: 3000,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    submissionRequirements: {
      type: String,
      required: [true, 'Submission requirements are required'],
      default: 'Please describe the actions taken and lessons learned during this challenge.',
      maxlength: 1000,
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Challenge: mongoose.model('Challenge', challengeSchema),
  challengeCategories,
};
