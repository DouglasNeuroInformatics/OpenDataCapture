import { ApiProperty } from '@nestjs/swagger';

import { ValidationSchema } from '@/core/validation-schema.decorator';

interface LoginCredentials {
  username: string;
  password: string;
}

@ValidationSchema<LoginCredentials>({
  type: 'object',
  properties: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  },
  additionalProperties: false,
  required: ['username', 'password']
})
export class LoginCredentialsDto implements LoginCredentials {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
