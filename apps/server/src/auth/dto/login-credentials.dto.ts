import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { LoginCredentials } from 'common';

export class LoginCredentialsDto implements LoginCredentials {
  @ApiProperty({
    example: 'Admin'
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Password123'
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
