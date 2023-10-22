import type { Sex, Subject, SubjectIdentificationData } from '@open-data-capture/types';
import { type ZodType, z } from 'zod';

export const sexSchema = z.enum(['male', 'female']) satisfies ZodType<Sex>;

export const subjectSchema = z.object({
  dateOfBirth: z.coerce.date(),
  firstName: z.string().min(1),
  identifier: z.string().min(1),
  lastName: z.string().min(1),
  sex: sexSchema
}) satisfies ZodType<Subject>;

export const subjectIdentificationDataSchema = subjectSchema.omit({
  identifier: true
}) satisfies ZodType<SubjectIdentificationData>;
