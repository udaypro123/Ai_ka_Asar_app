import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'HR']),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  country: z.string().optional(),
  profession: z.string().optional(),
  industry: z.string().optional(),
  experience: z.string().optional(),
  employmentStatus: z.string().optional(),
  skills: z.array(z.string()).optional(),
  careerGoal: z.string().optional(),
  aiUsage: z.string().optional(),
  mobile: z.string().optional(),
  currentRole: z.string().optional(),
  previousRole: z.string().optional(),
  previousCompany: z.string().optional(),
  company: z.string().optional(),
  jobDescription: z.string().optional(),
  linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});
