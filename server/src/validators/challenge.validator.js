const { z } = require('zod');
const { challengeCategories } = require('../models/Challenge');

const challengeSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  category: z.enum(challengeCategories),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  pointsReward: z.number().int().min(5, 'Points must be at least 5').max(1000).default(50),
  xpReward: z.number().int().min(5, 'XP must be at least 5').max(1000).default(50),
  instructions: z.string().trim().min(20, 'Instructions must be at least 20 characters').max(3000),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  submissionRequirements: z.string().trim().min(10).max(1000).default('Please describe the actions taken and lessons learned.'),
});

module.exports = { challengeSchema };
