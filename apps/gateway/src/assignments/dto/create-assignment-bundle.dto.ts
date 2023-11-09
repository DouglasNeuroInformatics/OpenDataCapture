import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { CreateAssignmentBundleData } from '@open-data-capture/common/assignment';
import { createAssignmentBundleDataSchema } from '@open-data-capture/common/assignment';

@ValidationSchema<CreateAssignmentBundleData>(createAssignmentBundleDataSchema)
export class CreateAssignmentBundleDto {
  expiresAt: Date;
  instrumentBundle: string;
  instrumentId: string;
  subjectIdentifier: string;
}
