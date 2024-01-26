import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { $LoginCredentials, type LoginCredentials } from '@open-data-capture/common/auth';

@ValidationSchema($LoginCredentials)
export class LoginRequestDto implements LoginCredentials {
  @ApiProperty({ example: 'password' })
  password: string;

  @ApiProperty({ example: 'admin' })
  username: string;
}
