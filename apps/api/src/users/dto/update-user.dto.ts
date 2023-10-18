import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';

import { CreateUserDataSchema, CreateUserDto } from './create-user.dto';

@ValidationSchema(CreateUserDataSchema.partial())
export class UpdateGroupDto extends PartialType(CreateUserDto) {}
