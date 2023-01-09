import { AuthTokens } from 'common';

export class AuthTokensDto implements AuthTokens {
  accessToken: string;
  refreshToken: string;
}
