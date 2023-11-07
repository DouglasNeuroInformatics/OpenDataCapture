import { z } from 'zod';

import type { Sex, Subject, SubjectIdentificationData } from './subject.types';

export const sexSchema = z.enum(['male', 'female']) satisfies Zod.ZodType<Sex>;

export const subjectSchema = z.object({
  dateOfBirth: z.coerce.date(),
  firstName: z.string().min(1),
  identifier: z.string().min(1),
  lastName: z.string().min(1),
  sex: sexSchema
}) satisfies Zod.ZodType<Subject>;

export const subjectIdentificationDataSchema = subjectSchema.omit({
  identifier: true
}) satisfies Zod.ZodType<SubjectIdentificationData>;
