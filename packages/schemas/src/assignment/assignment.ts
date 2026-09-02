import { $Uint8ArrayLike } from '@douglasneuroinformatics/libjs';
import { z } from 'zod/v4';

import { $BaseModel, $Json } from '../core/core.js';
import { $InstrumentBundleContainer } from '../instrument/instrument.base.js';
const $AssignmentStatus = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

type AssignmentStatus = z.infer<typeof $AssignmentStatus>;

/** Fallback validity period (in days) for a new remote assignment when the instance has not configured one. */
const DEFAULT_ASSIGNMENT_DURATION_DAYS = 365;

/**
 * An self-contained object representing an assignment.
 */
type Assignment = z.infer<typeof $Assignment>;
const $Assignment = $BaseModel.extend({
  completedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date(),
  groupId: z.string().min(1).nullish(),
  instrumentId: z.string().min(1),
  status: $AssignmentStatus,
  subjectId: z.string().min(1),
  url: z.string().url()
});

type RemoteAssignment = z.infer<typeof $RemoteAssignment>;
const $RemoteAssignment = $Assignment.omit({ instrumentId: true, updatedAt: true }).extend({
  encryptedData: z.string().nullable(),
  symmetricKey: z.string().nullable()
});

/** The largest number of subjects one bulk operation may target. */
const BULK_ASSIGNMENT_MAX_SUBJECTS = 500;

/**
 * An expiry that must still be in the future *when the request is validated*.
 *
 * `z.date().min(new Date())` would freeze the comparison at the moment this module is imported,
 * which in a long-running API process is whenever it booted — so a stale boundary would keep
 * accepting expiries that have since passed. The check has to read the clock per parse.
 */
const $FutureDate = z.coerce.date().refine((value) => value.getTime() > Date.now(), {
  message: 'Expiry must be in the future'
});

const $UniqueStrings = z
  .array(z.string().min(1))
  .min(1)
  .refine((values) => new Set(values).size === values.length, { message: 'Values must be unique' });

/** The DTO transferred from the web client to the core API when creating an assignment */
type CreateAssignmentData = z.infer<typeof $CreateAssignmentData>;
const $CreateAssignmentData = z.object({
  expiresAt: $FutureDate,
  groupId: z.string().nullish(),
  instrumentId: z.string(),
  subjectId: z.string()
});

/**
 * One instrument and the expiry it is assigned with. A bulk operation carries a list of these and
 * applies every one of them to every selected subject, so N subjects and M timepoints create N * M
 * assignments.
 */
type BulkAssignmentTimepoint = z.infer<typeof $BulkAssignmentTimepoint>;
const $BulkAssignmentTimepoint = z.object({
  expiresAt: $FutureDate,
  instrumentId: z.string().min(1)
});

/**
 * Shared by preflight and create so the client cannot validate against one shape and submit
 * another. `allowDuplicates` is the caller's explicit acknowledgement of the conflicts preflight
 * reported; without it a conflict fails the whole operation.
 */
const $BulkAssignmentRequestBase = z.object({
  allowDuplicates: z.boolean().default(false),
  groupId: z.string().min(1),
  subjectIds: $UniqueStrings.max(BULK_ASSIGNMENT_MAX_SUBJECTS),
  timepoints: z
    .array($BulkAssignmentTimepoint)
    .min(1)
    .refine((values) => new Set(values.map(({ instrumentId }) => instrumentId)).size === values.length, {
      message: 'Each instrument may only be assigned once'
    })
});

type BulkAssignmentPreflightData = z.infer<typeof $BulkAssignmentPreflightData>;
const $BulkAssignmentPreflightData = $BulkAssignmentRequestBase;

type CreateBulkAssignmentsData = z.infer<typeof $CreateBulkAssignmentsData>;
const $CreateBulkAssignmentsData = $BulkAssignmentRequestBase;

/**
 * Why a bulk operation was refused. `SUBJECT_UNAVAILABLE` deliberately does not distinguish a
 * subject that does not exist from one outside the selected group — telling them apart would let a
 * caller probe for subjects in groups they cannot read.
 */
type BulkAssignmentIssue = z.infer<typeof $BulkAssignmentIssue>;
const $BulkAssignmentIssue = z.discriminatedUnion('kind', [
  z.object({
    conflicts: z
      .array(
        z.object({
          instrumentId: z.string().min(1),
          subjectId: z.string().min(1)
        })
      )
      .min(1),
    kind: z.literal('CONFLICT')
  }),
  z.object({
    instrumentIds: $UniqueStrings,
    kind: z.literal('INSTRUMENT_UNAVAILABLE')
  }),
  z.object({
    kind: z.literal('SUBJECT_UNAVAILABLE'),
    subjectIds: $UniqueStrings
  })
]);

/**
 * The body returned with a non-2xx status from either bulk route. A bulk operation is
 * all-or-nothing: whenever this is returned, nothing was created and nothing was changed.
 */
type BulkAssignmentFailure = z.infer<typeof $BulkAssignmentFailure>;
const $BulkAssignmentFailure = z.object({
  code: z.literal('BULK_ASSIGNMENT_REFUSED'),
  issues: z.array($BulkAssignmentIssue).min(1)
});

type BulkAssignmentPreflightResult = z.infer<typeof $BulkAssignmentPreflightResult>;
const $BulkAssignmentPreflightResult = z.object({
  assignmentCount: z.number().int().nonnegative(),
  subjectCount: z.number().int().nonnegative(),
  timepointCount: z.number().int().nonnegative()
});

/** The DTO transferred from the core API to the external gateway when creating an assignment. */
type CreateRemoteAssignmentInputData = z.input<typeof $CreateRemoteAssignmentData>;
const $CreateRemoteAssignmentData = $RemoteAssignment.omit({ encryptedData: true, symmetricKey: true }).extend({
  instrumentContainer: $InstrumentBundleContainer,
  publicKey: $Uint8ArrayLike
});

/**
 * The DTO transferred from the core API to the external gateway when creating a batch.
 *
 * Bundles are carried in `instruments` and referenced by id from each assignment, rather than
 * inlined per assignment as the single-assignment DTO does: a batch applies a handful of
 * instruments to hundreds of subjects, so inlining would repeat every compiled bundle hundreds of
 * times over the wire.
 */
type CreateRemoteAssignmentsInputData = z.input<typeof $CreateRemoteAssignmentsData>;
const $CreateRemoteAssignmentsData = z.object({
  assignments: z
    .array(
      $RemoteAssignment.omit({ encryptedData: true, symmetricKey: true }).extend({
        instrumentId: z.string().min(1),
        publicKey: $Uint8ArrayLike
      })
    )
    .min(1),
  instruments: z
    .array(
      z.object({
        instrumentContainer: $InstrumentBundleContainer,
        instrumentId: z.string().min(1)
      })
    )
    .min(1)
});

type MutateAssignmentResponseBody = z.infer<typeof $MutateAssignmentResponseBody>;
const $MutateAssignmentResponseBody = z.object({
  success: z.boolean()
});

type UpdateAssignmentData = z.infer<typeof $UpdateAssignmentData>;
const $UpdateAssignmentData = z.object({
  status: $AssignmentStatus
});

type UpdateRemoteAssignmentData = z.infer<typeof $UpdateRemoteAssignmentData>;
const $UpdateRemoteAssignmentData = z.object({
  data: $Json.optional(),
  kind: z.enum(['SERIES', 'SCALAR']),
  status: z.literal('COMPLETE').optional()
});

export type {
  Assignment,
  AssignmentStatus,
  BulkAssignmentFailure,
  BulkAssignmentIssue,
  BulkAssignmentPreflightData,
  BulkAssignmentPreflightResult,
  BulkAssignmentTimepoint,
  CreateAssignmentData,
  CreateBulkAssignmentsData,
  CreateRemoteAssignmentInputData,
  CreateRemoteAssignmentsInputData,
  MutateAssignmentResponseBody,
  RemoteAssignment,
  UpdateAssignmentData,
  UpdateRemoteAssignmentData
};

export {
  $Assignment,
  $AssignmentStatus,
  $BulkAssignmentFailure,
  $BulkAssignmentIssue,
  $BulkAssignmentPreflightData,
  $BulkAssignmentPreflightResult,
  $BulkAssignmentTimepoint,
  $CreateAssignmentData,
  $CreateBulkAssignmentsData,
  $CreateRemoteAssignmentData,
  $CreateRemoteAssignmentsData,
  $MutateAssignmentResponseBody,
  $RemoteAssignment,
  $UpdateAssignmentData,
  $UpdateRemoteAssignmentData,
  BULK_ASSIGNMENT_MAX_SUBJECTS,
  DEFAULT_ASSIGNMENT_DURATION_DAYS
};
