import type { CreateVisitData, Visit } from '@open-data-capture/types';
import { z } from 'zod';

import { subjectIdentificationDataSchema, subjectSchema } from './subject.schema';

export const visitSchema = z.object({
  date: z.coerce.date(),
  subject: subjectSchema
}) satisfies Zod.ZodType<Visit>;

export const createVisitDataSchema = z.object({
  date: z.coerce.date(),
  subjectIdData: subjectIdentificationDataSchema
}) satisfies Zod.ZodType<CreateVisitData>;
