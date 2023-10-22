import type { AssignmentStatus, CreateAssignmentData, UpdateAssignmentData } from '@open-data-capture/types';
import { type ZodType, z } from 'zod';

import { validObjectIdSchema } from './core.schema';

export const createAssignmentDataSchema = z.object({
  instrumentId: validObjectIdSchema,
  subjectId: validObjectIdSchema
}) satisfies ZodType<CreateAssignmentData>;

export const assignmentStatusSchema = z.enum([
  'CANCELED',
  'COMPLETE',
  'EXPIRED',
  'OUTSTANDING'
]) satisfies ZodType<AssignmentStatus>;

export const updateAssignmentDataSchema = z.object({
  status: assignmentStatusSchema,
  timeExpires: z.number().int().positive()
}) satisfies ZodType<UpdateAssignmentData>;
