const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: 200,
      index: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, 'Learning content is required'],
    },
    targetAudience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    estimatedMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 180,
      default: 5,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    externalUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

learningResourceSchema.index({ title: 'text', shortDescription: 'text', content: 'text' });

module.exports = mongoose.model('LearningResource', learningResourceSchema);
