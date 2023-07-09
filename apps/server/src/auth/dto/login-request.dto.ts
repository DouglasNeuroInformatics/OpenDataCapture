import { ApiProperty } from '@nestjs/swagger';

import { Fingerprint, LoginRequest } from '@ddcp/types';
import { IsNotEmptyObject, IsString } from 'class-validator';

export class LoginRequestDto implements LoginRequest {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmptyObject()
  fingerprint?: Fingerprint | null;
}
