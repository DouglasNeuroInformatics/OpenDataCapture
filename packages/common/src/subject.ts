import { z } from 'zod';

export const sexSchema = z.enum(['male', 'female']);

export type Sex = z.infer<typeof sexSchema>;

export const subjectIdentificationDataSchema = z.object({
  dateOfBirth: z.coerce.date(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sex: sexSchema
});

export type SubjectIdentificationData = z.infer<typeof subjectIdentificationDataSchema>;

export const subjectSchema = subjectIdentificationDataSchema.extend({
  firstName: z.string().min(1).nullable(),
  identifier: z.string().min(1),
  lastName: z.string().min(1).nullable()
});

export type Subject = z.infer<typeof subjectSchema>;
