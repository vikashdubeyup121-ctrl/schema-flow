import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500).optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional(),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
