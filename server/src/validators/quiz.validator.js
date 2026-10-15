const { z } = require('zod');

const questionItemSchema = z.object({
  questionText: z.string().trim().min(5, 'Question text must be at least 5 characters'),
  options: z.array(z.string().trim().min(1, 'Option cannot be empty')).length(4, 'Must provide exactly 4 options'),
  correctOptionIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(5, 'Explanation must be provided for educational transparency'),
});

const quizSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  topic: z.string().trim().min(2, 'Topic is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  timeLimitMinutes: z.number().int().min(1).max(60).default(10),
  passingScore: z.number().int().min(10).max(100).default(60),
  pointsReward: z.number().int().min(5).max(500).default(30),
  xpReward: z.number().int().min(5).max(500).default(30),
  questions: z.array(questionItemSchema).min(1, 'Quiz must have at least one question'),
});

const quizSubmissionSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionIndex: z.number().int().min(0).max(3),
    })
  ).min(1, 'Must submit answers to questions'),
  timeSpentSeconds: z.number().int().min(0).default(0),
});

module.exports = {
  quizSchema,
  quizSubmissionSchema,
};
