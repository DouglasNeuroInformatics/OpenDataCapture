import type { AssignmentModel, AssignmentRecordModel } from '@open-data-capture/database/gateway';
import { z } from 'zod';

import { $BaseModel, $Json } from './core';

import type { Json } from './core';

export const $AssignmentStatus = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

export type AssignmentStatus = z.infer<typeof $AssignmentStatus>;

/**
 * An self-contained object representing an assignment. This is stored on the gateway itself.
 */
export type Assignment = AssignmentModel;
export const $Assignment = $BaseModel.extend({
  expiresAt: z.coerce.date(),
  instrumentBundle: z.string().min(1),
  instrumentId: z.string().min(1),
  status: $AssignmentStatus,
  subjectId: z.string().min(1),
  url: z.string().url()
}) satisfies z.ZodType<AssignmentModel>;

/**
 * An object representing a completed assignment. This is stored on the gateway itself. Since the
 * gateway uses an SQLite database, the JSON data is stored as a string, which then needs to be
 * transformed
 */
export type AssignmentRecord = Omit<AssignmentRecordModel, 'data'> & { data: Json };
export const $AssignmentRecord = $BaseModel.extend({
  assignment: $Assignment,
  assignmentId: z.string().min(1),
  completedAt: z.coerce.date(),
  data: z
    .string()
    .transform((arg) => JSON.parse(arg) as unknown)
    .pipe($Json)
}) satisfies z.ZodType<AssignmentRecord, z.ZodTypeDef, AssignmentRecordModel>;

/** The DTO transferred from the web client to the core API when creating an assignment */
export type CreateAssignmentData = z.infer<typeof $CreateAssignmentData>;
export const $CreateAssignmentData = z.object({
  expiresAt: z.coerce.date().min(new Date()),
  instrumentId: z.string(),
  subjectId: z.string()
});

/** The DTO transferred from the core API to the external gateway when creating an assignment */
export type CreateAssignmentRelayData = z.infer<typeof $CreateAssignmentRelayData>;
export const $CreateAssignmentRelayData = $CreateAssignmentData.extend({
  instrumentBundle: z.string().min(1)
});

/** The response body returned when creating an assignment, on any server */
export type CreateAssignmentResponseBody = z.infer<typeof $CreateAssignmentResponseBody>;
export const $CreateAssignmentResponseBody = z.object({
  success: z.boolean()
});

/**
 * The DTO transferred when updating an assignment. Note that this does not include
 * submitting a record, which is a distinct entity.
 */
export type UpdateAssignmentData = z.infer<typeof $UpdateAssignmentData>;
export const $UpdateAssignmentData = z
  .object({
    expiresAt: z.coerce.date(),
    status: $AssignmentStatus
  })
  .partial();
