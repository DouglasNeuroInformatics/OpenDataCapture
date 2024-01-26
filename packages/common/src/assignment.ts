import { z } from 'zod';

import { $BaseModel, $Json } from './core';

export const $AssignmentStatus = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

export type AssignmentStatus = z.infer<typeof $AssignmentStatus>;

/**
 * An self-contained object representing an assignment. This is stored on the gateway itself.
 */
export type Assignment = z.infer<typeof $Assignment>;
export const $Assignment = $BaseModel.extend({
  data: $Json.nullable(),
  expiresAt: z.coerce.date(),
  instrumentBundle: z.string().min(1),
  instrumentId: z.string().min(1),
  status: $AssignmentStatus,
  subjectId: z.string().min(1),
  url: z.string().url()
});

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
    data: $Json,
    expiresAt: z.coerce.date()
  })
  .partial();
