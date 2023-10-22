import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { loginCredentialsSchema } from '@open-data-capture/schemas/auth';
import type { LoginCredentials } from '@open-data-capture/types';

@ValidationSchema(loginCredentialsSchema)
export class LoginRequestDto implements LoginCredentials {
  @ApiProperty({ example: 'password' })
  password: string;

  @ApiProperty({ example: 'admin' })
  username: string;
}
