import { z } from 'zod';

export const PatchOperationSchema = z.object({
  type: z.string(),
  payload: z.any(),
});

export const PatchSchema = z.object({
  operations: z.array(PatchOperationSchema),
});

export type PatchDto = z.infer<typeof PatchSchema>;
