import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    description: 'Grants access to protected resources and includes claims for user permissions'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Used to obtain a new access token without needing to re-authenticate.'
  })
  refreshToken: string;
}
