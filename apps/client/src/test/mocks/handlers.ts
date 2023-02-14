import { LoginCredentials } from 'common';
import { rest } from 'msw';

export const handlers = [
  rest.post<LoginCredentials>('/api/auth/login', (req, res, ctx) => {
    sessionStorage.setItem('is-authenticated', 'true');
    return res(
      ctx.status(200),
      ctx.json({
        accessToken: 'foo',
        refreshToken: 'bar'
      })
    );
  })
];
