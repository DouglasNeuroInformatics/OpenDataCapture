import { ApiProperty } from '@nestjs/swagger';
import type { AuthPayload } from '@open-data-capture/types';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
