import { ApiProperty } from '@nestjs/swagger';

import { LoginCredentials, loginCredentialsSchema } from '@douglasneuroinformatics/common/auth';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

@ValidationSchema<LoginCredentials>(loginCredentialsSchema)
export class LoginCredentialsDto implements LoginCredentials {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
