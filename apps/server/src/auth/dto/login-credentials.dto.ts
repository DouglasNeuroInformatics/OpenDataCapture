import { ApiProperty } from '@nestjs/swagger';

import { LoginCredentials, loginCredentialsSchema } from '@ddcp/common/auth';

import { Dto } from '@/core/decorators/dto.decorator';

@Dto<LoginCredentials>(loginCredentialsSchema)
export class LoginCredentialsDto {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
