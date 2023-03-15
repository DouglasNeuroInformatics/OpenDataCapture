import { createMock } from '@golevelup/ts-jest';

import { AuthService } from '@/auth/auth.service';

export const MockAuthService = createMock<AuthService>({
  login: () =>
    Promise.resolve({
      accessToken: 'token',
      refreshToken: 'token'
    })
});
