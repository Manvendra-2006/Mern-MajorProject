const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: 1000,
    },
    options: {
      type: [String],
      validate: {
        validator: (opts) => opts && opts.length === 4,
        message: 'Each question must have exactly 4 options',
      },
      required: true,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required for learning transparency'],
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: 150,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      trim: true,
      maxlength: 2000,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    timeLimitMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 60,
      default: 10,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
      default: 60, // Percentage
    },
    pointsReward: {
      type: Number,
      required: true,
      min: 5,
      max: 500,
      default: 30,
    },
    xpReward: {
      type: Number,
      required: true,
      min: 5,
      max: 500,
      default: 30,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (q) => q && q.length >= 1,
        message: 'A quiz must contain at least 1 question',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
