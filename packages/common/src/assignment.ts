import { z } from 'zod';

import { $ValidObjectId } from './core';
import { $BaseInstrumentSummary, $Instrument, type BaseInstrumentSummary } from './instrument';

export const $AssignmentStatus = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

export type AssignmentStatus = z.infer<typeof $AssignmentStatus>;

export const $Assignment = z.object({
  assignedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  id: z.coerce.string().optional(),
  instrument: $Instrument,
  status: $AssignmentStatus,
  url: z.string().url()
});

export type Assignment = z.infer<typeof $Assignment>;

export type AssignmentSummary = Omit<Assignment, 'instrument'> & {
  instrument: BaseInstrumentSummary;
};

export const $AssignmentSummary = $Assignment.extend({
  instrument: $BaseInstrumentSummary
}) satisfies z.ZodType<AssignmentSummary>;

export type CreateAssignmentData = {
  expiresAt: Date;
  instrumentId: string;
  subjectIdentifier: string;
};

export const $CreateAssignmentData = z.object({
  expiresAt: z.coerce.date().min(new Date()),
  instrumentId: $ValidObjectId,
  subjectIdentifier: z.string()
}) satisfies z.ZodType<CreateAssignmentData>;

export const $UpdateAssignmentData = z
  .object({
    expiresAt: z.coerce.date(),
    record: z.object({
      data: z.any().transform((arg) => JSON.stringify(arg))
    }),
    status: $AssignmentStatus
  })
  .partial();

export type UpdateAssignmentData = z.infer<typeof $UpdateAssignmentData>;

export const $AssignmentBundle = $Assignment.omit({ instrument: true }).extend({
  instrumentBundle: z.string(),
  instrumentId: z.string(),
  subjectIdentifier: z.string()
});

export type AssignmentBundle = z.infer<typeof $AssignmentBundle>;

export const $CreateAssignmentBundleData = $AssignmentBundle.omit({
  assignedAt: true,
  id: true,
  status: true,
  url: true
});

export type CreateAssignmentBundleData = z.infer<typeof $CreateAssignmentBundleData>;
