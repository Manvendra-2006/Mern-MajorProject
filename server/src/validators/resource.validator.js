const { z } = require('zod');

const resourceSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
  topic: z.string().trim().min(2, 'Topic is required'),
  shortDescription: z.string().trim().min(10, 'Short description is required').max(500),
  content: z.string().trim().min(20, 'Content must be at least 20 characters'),
  targetAudience: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).default('All Levels'),
  estimatedMinutes: z.number().int().min(1).max(180).default(5),
  imageUrl: z.string().url().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().default(true),
});

module.exports = { resourceSchema };
