import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $LoginCredentials, type LoginCredentials } from '@opendatacapture/schemas/auth';

@ValidationSchema($LoginCredentials)
export class LoginRequestDto implements LoginCredentials {
  @ApiProperty({ example: 'password' })
  password: string;

  @ApiProperty({ example: 'admin' })
  username: string;
}
