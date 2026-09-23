import { z } from 'zod';

export const impactReportSchema = z.object({
  professionId: z.string().min(1, 'Profession is required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  impactStatus: z.string().min(1, 'Impact status is required'),
  impactAreas: z.array(z.string()).min(1, 'Select at least one area'),
  incomeImpact: z.string().min(1, 'Income impact is required'),
  description: z.string().optional(),
});

export const assessmentSchema = z.object({
  responses: z.record(z.any()),
});
