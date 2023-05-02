import { AuthPayload, LoginCredentials } from '@douglasneuroinformatics/common';
import { rest } from 'msw';

export const handlers = [
  rest.post<LoginCredentials>('/v1/auth/login', (req, res, ctx) => {
    sessionStorage.setItem('is-authenticated', 'true');
    return res(ctx.status(200), ctx.json({ accessToken: 'foo' } satisfies AuthPayload));
  })
];
