import { PartialType } from '@nestjs/swagger';

import { CreateFormDto } from './create-form.dto';

export class UpdateFormDto extends PartialType(CreateFormDto) {}
