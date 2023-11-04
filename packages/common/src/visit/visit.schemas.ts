import { z } from 'zod';

import { subjectIdentificationDataSchema, subjectSchema } from '../subject/subject.schemas';

import type { CreateVisitData, Visit } from './visit.types';

export const visitSchema = z.object({
  date: z.coerce.date(),
  id: z.string(),
  subject: subjectSchema
}) satisfies Zod.ZodType<Visit>;

export const createVisitDataSchema = z.object({
  date: z.coerce.date(),
  groupId: z.string().optional(),
  subjectIdData: subjectIdentificationDataSchema
}) satisfies Zod.ZodType<CreateVisitData>;
