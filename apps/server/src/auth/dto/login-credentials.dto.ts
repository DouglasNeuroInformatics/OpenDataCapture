import { ApiProperty } from '@nestjs/swagger';

import { Dto } from '@/core/decorators/dto.decorator';

interface LoginCredentials {
  username: string;
  password: string;
}

@Dto<LoginCredentials>({
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
export class LoginCredentialsDto {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
