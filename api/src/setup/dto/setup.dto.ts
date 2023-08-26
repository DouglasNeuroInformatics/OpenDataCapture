import { ApiProperty, OmitType } from '@nestjs/swagger';

import { SetupOptions } from '@ddcp/types';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { CreateUserDto } from '@/users/dto/create-user.dto.js';

export class CreateAdminDto extends OmitType(CreateUserDto, ['basePermissionLevel', 'groupNames'] as const) {}

export class SetupDto implements SetupOptions {
  @ApiProperty()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateAdminDto)
  admin: CreateAdminDto;

  @ApiProperty()
  @IsBoolean()
  initDemo: boolean;
}
