import { ApiProperty } from '@nestjs/swagger';
import type { LoginCredentials } from '@open-data-capture/types';
import { IsString } from 'class-validator';

export class LoginRequestDto implements LoginCredentials {
  @ApiProperty({ example: 'password' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;
}
