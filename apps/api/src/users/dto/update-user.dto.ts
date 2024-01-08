import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';
import { $CreateUserData } from '@open-data-capture/common/user';

import { CreateUserDto } from './create-user.dto';

@ValidationSchema($CreateUserData.partial())
export class UpdateUserDto extends PartialType(CreateUserDto) {}
