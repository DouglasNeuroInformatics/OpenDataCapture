import { ApiProperty } from '@nestjs/swagger';

import { AuthTokens } from 'common';

export class AuthTokensDto implements AuthTokens {
  @ApiProperty({
    description:
      "Grants access to protected resources and contains claims that can be used to determine the user's access level and permissions.",
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjczOTY5ODE1LCJleHAiOjE2NzQ1NzQ2MTV9.YnIV8e89Xr0fu8wrYczczD7oACBEY3uAiciFCl28ODk'
  })
  accessToken: string;

  @ApiProperty({
    description:
      'Used to obtain a new access token, allowing the user to continue to access a resource without needing to re-authenticate.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjczOTY5ODE1LCJleHAiOjE2NzQ1NzQ2MTV9.YnIV8e89Xr0fu8wrYczczD7oACBEY3uAiciFCl28ODk'
  })
  refreshToken: string;
}
