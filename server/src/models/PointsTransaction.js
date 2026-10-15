const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['CHALLENGE_REWARD', 'QUIZ_REWARD', 'ADMIN_ADJUSTMENT'],
      required: true,
      index: true,
    },
    referenceModel: {
      type: String,
      enum: ['Challenge', 'Quiz', 'User'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Idempotency: guarantees that a user cannot receive duplicate rewards for the same challenge or quiz
pointsTransactionSchema.index({ user: 1, type: 1, referenceId: 1 }, { unique: true });

module.exports = mongoose.model('PointsTransaction', pointsTransactionSchema);
