import { z } from 'zod';

// Project creation schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be less than 10 characters')
    .regex(/^[A-Z][A-Z0-9]*$/, 'Project key must start with a letter and contain only uppercase letters and numbers'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  isPublic: z.boolean().default(false),
  accessibilityLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),
  highContrastMode: z.boolean().default(false),
  screenReaderOptimized: z.boolean().default(false),
});

// Project update schema
export const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  accessibilityLevel: z.enum(['A', 'AA', 'AAA']).optional(),
  highContrastMode: z.boolean().optional(),
  screenReaderOptimized: z.boolean().optional(),
});

// Add member schema
export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

// Update member schema
export const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

// Project search/filter schema
export const projectSearchSchema = z.object({
  query: z.string().optional(),
  isPublic: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  ownerId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type ProjectSearchInput = z.infer<typeof projectSearchSchema>;

// Project response type
export interface ProjectResponse {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isPublic: boolean;
  isArchived: boolean;
  accessibilityLevel: string;
  highContrastMode: boolean;
  screenReaderOptimized: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  memberCount?: number;
  userRole?: string;
}

// Project member response type
export interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

// Project list response
export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
