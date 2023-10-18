import { ObjectIdSchema, ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { type CreateAssignmentData } from '@open-data-capture/types';
import { ZodType, z } from 'zod';

const CreateAssignmentDataSchema: ZodType<CreateAssignmentData> = z.object({
  instrumentId: ObjectIdSchema,
  subjectId: ObjectIdSchema
});

@ValidationSchema(CreateAssignmentDataSchema)
export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  subjectId: string;
}
