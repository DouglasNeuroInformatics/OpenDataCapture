import { z } from 'zod';

import { $BaseModel, $Json, $Uint8Array } from './core';

export const $AssignmentStatus = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

export type AssignmentStatus = z.infer<typeof $AssignmentStatus>;

/**
 * An self-contained object representing an assignment.
 */
export type Assignment = z.infer<typeof $Assignment>;
export const $Assignment = $BaseModel.extend({
  completedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date(),
  instrumentId: z.string().min(1),
  status: $AssignmentStatus,
  subjectId: z.string().min(1),
  url: z.string().url()
});

export type RemoteAssignment = z.infer<typeof $RemoteAssignment>;
export const $RemoteAssignment = $Assignment.omit({ updatedAt: true }).extend({
  encryptedData: $Uint8Array.nullable(),
  instrumentBundle: z.string()
});

/** The DTO transferred from the web client to the core API when creating an assignment */
export type CreateAssignmentData = z.infer<typeof $CreateAssignmentData>;
export const $CreateAssignmentData = z.object({
  expiresAt: z.coerce.date().min(new Date()),
  instrumentId: z.string(),
  subjectId: z.string()
});

/** The DTO transferred from the core API to the external gateway when creating an assignment */
export type CreateRemoteAssignmentInputData = z.input<typeof $CreateRemoteAssignmentData>;
export const $CreateRemoteAssignmentData = $RemoteAssignment.omit({ encryptedData: true }).extend({
  publicKey: $Uint8Array
});

export type MutateAssignmentResponseBody = z.infer<typeof $MutateAssignmentResponseBody>;
export const $MutateAssignmentResponseBody = z.object({
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
    expiresAt: z.coerce.date(),
    status: $AssignmentStatus
  })
  .partial()
  .refine((arg) => !(arg.data && arg.status !== 'COMPLETE'), {
    message: 'Status must be complete if data is defined'
  });
