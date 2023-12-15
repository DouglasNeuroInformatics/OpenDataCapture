import type { SubjectModel } from '@open-data-capture/database/core';
import { z } from 'zod';

export const $Sex = z.enum(['male', 'female']);

export type Sex = z.infer<typeof $Sex>;

export const $SubjectIdentificationData = z.object({
  dateOfBirth: z.coerce.date(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sex: $Sex
});

export type SubjectIdentificationData = z.infer<typeof $SubjectIdentificationData>;

export type Subject = SubjectModel;

export const $Subject = $SubjectIdentificationData.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: z.string().min(1),
  groupIds: z.array(z.string().min(1)),
  firstName: z.string().min(1).nullable(),
  identifier: z.string().min(1),
  lastName: z.string().min(1).nullable()
}) satisfies Zod.ZodType<Subject>;
