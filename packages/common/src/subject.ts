import type { SubjectModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $BaseModel } from './core';

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

export const $Subject = $BaseModel.merge(
  $SubjectIdentificationData.extend({
    firstName: z.string().min(1).nullable(),
    groupIds: z.array(z.string().min(1)),
    identifier: z.string().min(1),
    lastName: z.string().min(1).nullable()
  })
);
