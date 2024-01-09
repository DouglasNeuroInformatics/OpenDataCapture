import type { AssignmentModel, AssignmentRecordModel } from '@open-data-capture/database/gateway';
import { z } from 'zod';

import { $BaseModel, $Json, type Json } from './core';

export const $AssignmentStatus = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

export type AssignmentStatus = z.infer<typeof $AssignmentStatus>;

export const $Assignment = $BaseModel.extend({
  expiresAt: z.coerce.date(),
  instrumentBundle: z.string().min(1),
  instrumentId: z.string().min(1),
  status: $AssignmentStatus,
  subjectId: z.string().min(1),
  url: z.string().url()
}) satisfies z.ZodType<AssignmentModel>;

export type Assignment = AssignmentModel;

export type AssignmentRecord = Omit<AssignmentRecordModel, 'data'> & {
  data: Json;
};

export const $AssignmentRecord = $BaseModel.extend({
  assignment: $Assignment,
  assignmentId: z.string().min(1),
  completedAt: z.coerce.date(),
  data: z
    .string()
    .transform((arg) => JSON.parse(arg) as unknown)
    .pipe($Json)
}) satisfies z.ZodType<AssignmentRecord, z.ZodTypeDef, AssignmentRecordModel>;

export const $CreateAssignmentData = z.object({
  expiresAt: z.coerce.date().min(new Date()),
  instrumentId: z.string(),
  subjectId: z.string()
});

export type CreateAssignmentData = z.infer<typeof $CreateAssignmentData>;

export const $UpdateAssignmentData = z
  .object({
    expiresAt: z.coerce.date(),
    status: $AssignmentStatus
  })
  .partial();

export type UpdateAssignmentData = z.infer<typeof $UpdateAssignmentData>;
