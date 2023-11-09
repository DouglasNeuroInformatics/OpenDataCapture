import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { AssignmentBundle } from '@open-data-capture/common/assignment';
import { assignmentBundleSchema } from '@open-data-capture/common/assignment';

@ValidationSchema<AssignmentBundle>(assignmentBundleSchema)
export class CreateAssignmentBundleDto {
  assignedAt: Date;
  expiresAt: Date;
  instrumentBundle: string;
  instrumentId: string;
  status: 'CANCELED' | 'COMPLETE' | 'EXPIRED' | 'OUTSTANDING';
  subjectIdentifier: string;
  url: string;
}
