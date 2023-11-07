import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';
import { createUserDataSchema } from '@open-data-capture/common/user';

import { CreateUserDto } from './create-user.dto';

@ValidationSchema(createUserDataSchema.partial())
export class UpdateUserDto extends PartialType(CreateUserDto) {}
