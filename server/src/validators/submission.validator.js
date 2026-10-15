const { z } = require('zod');

const submitChallengeSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  proofText: z.string().trim().min(20, 'Please provide at least 20 characters describing what you did').max(3000),
  proofFileUrl: z.string().url().optional().or(z.literal('')),
});

const reviewSubmissionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().trim().max(1000).optional().default(''),
});

module.exports = {
  submitChallengeSchema,
  reviewSubmissionSchema,
};
