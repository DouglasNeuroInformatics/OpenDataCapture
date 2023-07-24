import { ApiProperty } from '@nestjs/swagger';

import { Fingerprint, LoginRequest } from '@ddcp/types';
import { IsNotEmptyObject, IsString } from 'class-validator';

class FingerprintDto implements Fingerprint {
  @ApiProperty({})
  visitorId: string;

  @ApiProperty()
  language: string;

  @ApiProperty({ type: [Number] })
  screenResolution?: [number | null, number | null];
}

export class LoginRequestDto implements LoginRequest {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  password: string;

  @ApiProperty({ type: FingerprintDto })
  @IsNotEmptyObject()
  fingerprint?: FingerprintDto | null;
}
