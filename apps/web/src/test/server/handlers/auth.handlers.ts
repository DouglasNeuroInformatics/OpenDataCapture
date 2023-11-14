import type { AuthPayload, JwtPayload, LoginCredentials } from '@open-data-capture/common/auth';
import { UnsecuredJWT } from 'jose';
import { HttpResponse, http } from 'msw';
import { type RequestHandler } from 'msw';

import { adminUser } from '../stubs';

export const authHandlers: RequestHandler[] = [
  http.post('/v1/auth/login', async ({ request }) => {
    const { password, username } = (await request.json()) as LoginCredentials;
    if (username !== adminUser.username || password !== adminUser.password) {
      return new HttpResponse('Unauthorized', { status: 401 });
    }
    const payload: JwtPayload = { ...adminUser, permissions: [{ action: 'manage', subject: 'all' } as const] };

    const accessToken = new UnsecuredJWT(payload).setIssuedAt().setExpirationTime('2h').encode();

    return HttpResponse.json<AuthPayload>({ accessToken }, { status: 200 });
  })
];
