import { ApiProperty } from '@nestjs/swagger';
import type { AuthPayload } from '@open-data-capture/schemas/auth';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
