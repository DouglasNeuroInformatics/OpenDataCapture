import { ApiProperty } from '@nestjs/swagger';

import { AuthPayload } from '@douglasneuroinformatics/common';

export class AccessTokenDto implements AuthPayload {
  @ApiProperty()
  accessToken: string;
}
