import { z } from 'zod';

import { $BaseModel } from '../core/core.js';

export type Sex = z.infer<typeof $Sex>;
export const $Sex = z.enum(['MALE', 'FEMALE']);

export type ClinicalSubjectIdentificationData = z.infer<typeof $ClinicalSubjectIdentificationData>;
export const $ClinicalSubjectIdentificationData = z.object({
  dateOfBirth: z.coerce.date(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sex: $Sex
});

export type Subject = z.infer<typeof $Subject>;
export const $Subject = $BaseModel.extend({
  dateOfBirth: z.coerce.date().nullish(),
  firstName: z.string().min(1).nullish(),
  groupIds: z.array(z.string().min(1)),
  lastName: z.string().min(1).nullish(),
  sex: $Sex.nullish()
});

export type CreateSubjectData = z.infer<typeof $CreateSubjectData>;
export const $CreateSubjectData = $Subject.pick({
  dateOfBirth: true,
  firstName: true,
  id: true,
  lastName: true,
  sex: true
});
