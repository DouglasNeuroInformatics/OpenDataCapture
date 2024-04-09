import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { PartialType } from '@nestjs/swagger';
import { $UpdateUserData } from '@opendatacapture/schemas/user';

import { CreateUserDto } from './create-user.dto';

@ValidationSchema($UpdateUserData)
export class UpdateUserDto extends PartialType(CreateUserDto) {}
