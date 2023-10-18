import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';

import { SubjectIdentificationDataDto, SubjectIdentificationDataSchema } from './subject-identification-data.dto';

@ValidationSchema(SubjectIdentificationDataSchema.partial())
export class UpdateSubjectDto extends PartialType(SubjectIdentificationDataDto) {}
