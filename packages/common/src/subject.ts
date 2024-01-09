import type { SubjectModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $BaseModel } from './core';

export type Sex = z.infer<typeof $Sex>;
export const $Sex = z.enum(['male', 'female']);

export type SubjectIdentificationData = z.infer<typeof $SubjectIdentificationData>;
export const $SubjectIdentificationData = z.object({
  dateOfBirth: z.coerce.date(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sex: $Sex
});

export type Subject = SubjectModel;
export const $Subject = $BaseModel.extend({
  dateOfBirth: z.coerce.date(),
  firstName: z.string().min(1).nullable(),
  groupIds: z.array(z.string().min(1)),
  lastName: z.string().min(1).nullable(),
  sex: $Sex
}) satisfies z.ZodType<SubjectModel>;
