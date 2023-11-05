import { ApiProperty } from '@nestjs/swagger';
import type { AuthPayload } from '@open-data-capture/common/auth';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
