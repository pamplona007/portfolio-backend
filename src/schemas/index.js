import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Education schemas
export const createEducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  current: z.boolean().optional().default(false),
});

export const updateEducationSchema = z.object({
  institution: z.string().optional(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  current: z.boolean().optional(),
});

// Experience schemas
export const createExperienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  current: z.boolean().optional().default(false),
});

export const updateExperienceSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  current: z.boolean().optional(),
});

// Skill schemas
export const createSkillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  level: z.number().int().min(1).max(5, 'Level must be between 1 and 5'),
  category: z.string().min(1, 'Category is required'),
});

export const updateSkillSchema = z.object({
  name: z.string().optional(),
  level: z.number().int().min(1).max(5).optional(),
  category: z.string().optional(),
});

// Project schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.array(z.string()).min(1, 'Tech stack must have at least one item'),
  link: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  featured: z.boolean().optional().default(false),
});

export const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  link: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
});
