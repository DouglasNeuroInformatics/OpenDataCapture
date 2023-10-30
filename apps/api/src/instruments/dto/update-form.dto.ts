import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';
import { formInstrumentSchema } from '@open-data-capture/common/instrument';

import { CreateFormDto } from './create-form.dto';

@ValidationSchema(formInstrumentSchema.partial())
export class UpdateFormDto extends PartialType(CreateFormDto) {}
