const { z } = require('zod');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().regex(passwordPattern, passwordMessage),
  role: z.enum(['student', 'teacher']).default('student'),
  schoolOrCollege: z.string().trim().max(150).optional().default(''),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const otpRequestSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  purpose: z.enum(['verification', 'reset']).default('verification'),
});

const otpVerifySchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d{6}$/, 'Verification code must contain digits only'),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d{6}$/, 'Verification code must contain digits only'),
  newPassword: z.string().regex(passwordPattern, passwordMessage),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  resetPasswordSchema,
};
