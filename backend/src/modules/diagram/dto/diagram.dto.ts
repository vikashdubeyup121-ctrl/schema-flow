import { z } from 'zod';

export const CreateDiagramSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

export const UpdateDiagramSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional(),
  dslText: z.string().optional(),
});

export const ViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(4.0),
});

export type CreateDiagramDto = z.infer<typeof CreateDiagramSchema>;
export type UpdateDiagramDto = z.infer<typeof UpdateDiagramSchema>;
export type ViewportDto = z.infer<typeof ViewportSchema>;
