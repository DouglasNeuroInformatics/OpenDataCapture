import { ApiProperty } from '@nestjs/swagger';

import { AuthPayload } from '@ddcp/common';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
