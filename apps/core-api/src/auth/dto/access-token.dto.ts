import { ApiProperty } from '@nestjs/swagger';

import { AuthPayload } from '@open-data-capture/types';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
