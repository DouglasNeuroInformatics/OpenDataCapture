import { $Uint8ArrayLike } from '@douglasneuroinformatics/libjs';
import { z } from 'zod/v4';

import { $BaseModel, $Json } from '../core/core.js';
import { $InstrumentBundleContainer } from '../instrument/instrument.base.js';
export const $AssignmentStatus = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

export type AssignmentStatus = z.infer<typeof $AssignmentStatus>;

/**
 * An self-contained object representing an assignment.
 */
export type Assignment = z.infer<typeof $Assignment>;
export const $Assignment = $BaseModel.extend({
  completedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date(),
  groupId: z.string().min(1).nullish(),
  instrumentId: z.string().min(1),
  status: $AssignmentStatus,
  subjectId: z.string().min(1),
  url: z.string().url()
});

export type RemoteAssignment = z.infer<typeof $RemoteAssignment>;
export const $RemoteAssignment = $Assignment.omit({ instrumentId: true, updatedAt: true }).extend({
  encryptedData: z.string().nullable(),
  symmetricKey: z.string().nullable()
});

/** The DTO transferred from the web client to the core API when creating an assignment */
export type CreateAssignmentData = z.infer<typeof $CreateAssignmentData>;
export const $CreateAssignmentData = z.object({
  expiresAt: z.coerce.date().min(new Date()),
  groupId: z.string().nullish(),
  instrumentId: z.string(),
  subjectId: z.string()
});

/** The DTO transferred from the core API to the external gateway when creating an assignment */
export type CreateRemoteAssignmentInputData = z.input<typeof $CreateRemoteAssignmentData>;
export const $CreateRemoteAssignmentData = $RemoteAssignment.omit({ encryptedData: true, symmetricKey: true }).extend({
  instrumentContainer: $InstrumentBundleContainer,
  publicKey: $Uint8ArrayLike
});

export type MutateAssignmentResponseBody = z.infer<typeof $MutateAssignmentResponseBody>;
export const $MutateAssignmentResponseBody = z.object({
  success: z.boolean()
});

export type UpdateAssignmentData = z.infer<typeof $UpdateAssignmentData>;
export const $UpdateAssignmentData = z.object({
  status: $AssignmentStatus
});

export type UpdateRemoteAssignmentData = z.infer<typeof $UpdateRemoteAssignmentData>;
export const $UpdateRemoteAssignmentData = z.object({
  data: $Json.optional(),
  kind: z.enum(['SERIES', 'SCALAR']),
  status: z.literal('COMPLETE').optional()
});
