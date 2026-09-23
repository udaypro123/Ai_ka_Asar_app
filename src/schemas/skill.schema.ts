import { z } from 'zod';

export const skillUpdateSchema = z.object({
  skillId: z.string().min(1, 'Skill ID is required'),
  level: z.number().min(0).max(100, 'Level must be between 0 and 100'),
});
