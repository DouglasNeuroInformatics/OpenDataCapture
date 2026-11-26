import { Controller, Get, HttpStatus } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThrottleRefreshRequest } from '../throttle-refresh-request.decorator';

const MEDIUM_LIMIT = 3;

// Lower limits than the real ones, so a test reaches them in a handful of requests.
vi.mock('../../constants', () => ({
  REFRESH_REQUEST_THROTTLER_LONG_LIMIT: 5,
  REFRESH_REQUEST_THROTTLER_MEDIUM_LIMIT: 3
}));

@Controller()
class AppController {
  @Get()
  @ThrottleRefreshRequest()
  get() {
    return { success: true };
  }
}

/** A bearer header whose token carries `payload`, signed by nobody, which is all the tracker reads. */
const bearer = (payload: unknown) => {
  return `Bearer header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
};

describe('ThrottleRefreshRequest', () => {
  let app: NestFastifyApplication;

  const request = async (authorization?: string, remoteAddress = '203.0.113.1'): Promise<number> => {
    const response = await app.inject({
      headers: authorization === undefined ? {} : { authorization },
      method: 'GET',
      remoteAddress,
      url: '/'
    });
    return response.statusCode;
  };

  const exhaustMediumLimit = async (authorization?: string, remoteAddress?: string): Promise<void> => {
    for (let i = 0; i < MEDIUM_LIMIT; i++) {
      expect(await request(authorization, remoteAddress)).toBe(HttpStatus.OK);
    }
    expect(await request(authorization, remoteAddress)).toBe(HttpStatus.TOO_MANY_REQUESTS);
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        ThrottlerModule.forRoot([
          { limit: 1000, name: 'short', ttl: 1000 },
          { limit: 1000, name: 'medium', ttl: 10_000 },
          { limit: 1000, name: 'long', ttl: 60_000 }
        ])
      ],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter({}));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should count each user on their own, so one exhausting the limit does not stop another at the same address', async () => {
    await exhaustMediumLimit(bearer({ id: 'user-1' }));
    expect(await request(bearer({ id: 'user-2' }))).toBe(HttpStatus.OK);
  });

  it('should count a user at another address separately, so an id forged elsewhere cannot spend their limit', async () => {
    await exhaustMediumLimit(bearer({ id: 'user-1' }));
    expect(await request(bearer({ id: 'user-1' }), '203.0.113.2')).toBe(HttpStatus.OK);
  });

  it('should count every address in one IPv6 subnet together, so changing address within it does not get a fresh limit', async () => {
    await exhaustMediumLimit(bearer({ id: 'user-1' }), '2001:db8:0:1::1');
    expect(await request(bearer({ id: 'user-1' }), '2001:db8:0:1::2')).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(await request(bearer({ id: 'user-1' }), '2001:db8:0:2::1')).toBe(HttpStatus.OK);
  });

  it.each([
    { authorization: undefined, description: 'no authorization header' },
    { authorization: 'Basic dXNlcjpwYXNz', description: 'a scheme other than bearer' },
    { authorization: 'Bearer not-a-token', description: 'a bearer value with no payload segment' },
    { authorization: 'Bearer header.bm90LWpzb24.signature', description: 'a payload that is not JSON' },
    { authorization: bearer({ username: 'no-id' }), description: 'a payload naming no user' }
  ])('should count a request with $description against its address', async ({ authorization }) => {
    await exhaustMediumLimit(authorization);
    expect(await request(undefined)).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(await request(bearer({ id: 'user-1' }))).toBe(HttpStatus.OK);
  });
});
