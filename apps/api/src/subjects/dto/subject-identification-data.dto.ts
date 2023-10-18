import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import type { Sex, SubjectIdentificationData } from '@open-data-capture/types';
import { ZodType, z } from 'zod';

const SexSchema: ZodType<Sex> = z.enum(['male', 'female']);

export const SubjectIdentificationDataSchema = z.object({
  dateOfBirth: z.coerce.date(),
  firstName: z.string(),
  lastName: z.string(),
  sex: SexSchema
});

@ValidationSchema(SubjectIdentificationDataSchema)
export class SubjectIdentificationDataDto implements SubjectIdentificationData {
  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  sex: Sex;
}
