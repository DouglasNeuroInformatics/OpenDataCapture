import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';

import { CreateFormDto, FormValidationSchema } from './create-form.dto';

const UpdateFormDtoSchema = FormValidationSchema.partial();

@ValidationSchema(UpdateFormDtoSchema)
export class UpdateFormDto extends PartialType(CreateFormDto) {}
