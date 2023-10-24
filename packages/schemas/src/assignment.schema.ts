import type Types from '@open-data-capture/types';
import { z } from 'zod';

import { validObjectIdSchema } from './core.schema';
import { formInstrumentSchema, formInstrumentSummarySchema } from './form-instrument.schema';

export const assignmentStatusSchema = z.enum([
  'CANCELED',
  'COMPLETE',
  'EXPIRED',
  'OUTSTANDING'
]) satisfies Zod.ZodType<Types.AssignmentStatus>;

export const assignmentSchema = z.object({
  assignedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  id: z.string().optional(),
  instrument: formInstrumentSchema,
  status: assignmentStatusSchema
}) satisfies Zod.ZodType<Types.Assignment>;

export const assignmentSummarySchema = assignmentSchema.extend({
  instrument: formInstrumentSummarySchema
}) satisfies Zod.ZodType<Types.AssignmentSummary>;

export const createAssignmentDataSchema = z.object({
  expiresAt: z.coerce.date(),
  instrumentId: validObjectIdSchema,
  subjectIdentifier: z.string()
}) satisfies Zod.ZodType<Types.CreateAssignmentData>;

export const updateAssignmentDataSchema = z
  .object({
    assignedAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    status: assignmentStatusSchema
  })
  .partial() satisfies Zod.ZodType<Types.UpdateAssignmentData>;
