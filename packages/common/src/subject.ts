import type { SubjectModel } from '@open-data-capture/database/core';
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

export type Subject = SubjectModel;

export const subjectSchema = subjectIdentificationDataSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: z.string().min(1),
  groupIds: z.array(z.string().min(1)),
  firstName: z.string().min(1).nullable(),
  identifier: z.string().min(1),
  lastName: z.string().min(1).nullable()
}) satisfies Zod.ZodType<Subject>;
