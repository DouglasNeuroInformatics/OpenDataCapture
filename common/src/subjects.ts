import { z } from 'zod';

export const sexOptions = ['male', 'female'] as const;
export type Sex = (typeof sexOptions)[number];

export const subjectSchema = z.object({
  dateOfBirth: z.coerce.date(),
  sex: z.enum(sexOptions),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  forwardSortationArea: z.string().optional()
});

export type Subject = z.infer<typeof subjectSchema>;
