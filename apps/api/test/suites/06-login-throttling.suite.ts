import { describe, expect, it } from 'vitest';

import { DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT } from '@/core/constants';

import { defineSuite } from '../helpers';

/** The bundled Caddy's address on the compose network, which every deployed request reaches the api from. */
const CADDY = '172.18.0.5';

export default defineSuite('login throttling', function () {
  const attemptLogin = async (remoteAddress: string, forwardedFor: string): Promise<number> => {
    const response = await this.app.inject({
      headers: { 'x-forwarded-for': forwardedFor },
      method: 'POST',
      payload: { password: 'WrongPassword1!', username: 'no-such-user' },
      remoteAddress,
      url: '/v1/auth/login'
    });
    return response.statusCode;
  };

  const exhaustLoginLimit = async (remoteAddress: string, forwardedFor: string): Promise<void> => {
    const statusCodes: number[] = [];
    while (statusCodes.at(-1) !== 429 && statusCodes.length <= DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT) {
      statusCodes.push(await attemptLogin(remoteAddress, forwardedFor));
    }
    expect(statusCodes.at(-1)).toBe(429);
  };

  describe('POST /v1/auth/login', () => {
    it.each([
      { caddy: CADDY, client: '203.0.113.1', otherClient: '198.51.100.77' },
      { caddy: 'fd00:18::5', client: '203.0.113.6', otherClient: '198.51.100.78' }
    ])(
      'should throttle each client Caddy at $caddy forwards on its own, so one exhausting the limit does not lock out another',
      async ({ caddy, client, otherClient }) => {
        await exhaustLoginLimit(caddy, client);
        expect(await attemptLogin(caddy, otherClient)).toBe(401);
      }
    );

    it.each([
      { client: '203.0.113.2', frontProxy: '172.18.0.1', otherClient: '203.0.113.3' },
      { client: '203.0.113.4', frontProxy: '198.51.100.200', otherClient: '203.0.113.5' }
    ])(
      'should key a client behind the front proxy $frontProxy on the address that proxy reports',
      async ({ client, frontProxy, otherClient }) => {
        await exhaustLoginLimit(CADDY, `${client}, ${frontProxy}`);
        expect(await attemptLogin(CADDY, `${otherClient}, ${frontProxy}`)).toBe(401);
      }
    );

    it('should key a private client behind an appending front proxy on its own address, not on one it forged', async () => {
      await exhaustLoginLimit(CADDY, '198.51.100.9, 10.1.2.3, 172.18.0.1');
      expect(await attemptLogin(CADDY, '198.51.100.10, 10.1.2.3, 172.18.0.1')).toBe(429);
    });

    it('should ignore X-Forwarded-For from a public peer, so a client reaching the api directly cannot pick its key', async () => {
      await exhaustLoginLimit('203.0.113.50', '192.0.2.1');
      expect(await attemptLogin('203.0.113.50', '192.0.2.2')).toBe(429);
    });
  });
});
