import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { AddGatewayAssignmentsData, Assignment } from '@open-data-capture/common/assignment';
import { addGatewayAssignmentsDataSchema } from '@open-data-capture/common/assignment';
import type { FormInstrument } from '@open-data-capture/common/instrument';

@ValidationSchema<AddGatewayAssignmentsData>(addGatewayAssignmentsDataSchema)
export class AddGatewayAssignmentsDto {
  assignments: Assignment<FormInstrument>[];
}
