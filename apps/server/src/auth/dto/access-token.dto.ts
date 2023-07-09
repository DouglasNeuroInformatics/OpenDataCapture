import { ApiProperty } from '@nestjs/swagger';

import { AuthPayload } from '@ddcp/types';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
