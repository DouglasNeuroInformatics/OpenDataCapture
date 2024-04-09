import { ApiProperty } from '@nestjs/swagger';
import type { AuthPayload } from '@opendatacapture/schemas/auth';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
