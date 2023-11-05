import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { type LoginCredentials, loginCredentialsSchema } from '@open-data-capture/common/auth';

@ValidationSchema(loginCredentialsSchema)
export class LoginRequestDto implements LoginCredentials {
  @ApiProperty({ example: 'password' })
  password: string;

  @ApiProperty({ example: 'admin' })
  username: string;
}
