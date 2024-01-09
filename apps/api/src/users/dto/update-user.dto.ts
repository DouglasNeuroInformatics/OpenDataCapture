import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';
import { $UpdateUserData } from '@open-data-capture/common/user';

import { CreateUserDto } from './create-user.dto';

@ValidationSchema($UpdateUserData)
export class UpdateUserDto extends PartialType(CreateUserDto) {}
