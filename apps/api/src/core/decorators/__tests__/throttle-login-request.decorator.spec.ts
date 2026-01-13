import { Controller, Get, HttpStatus } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const MOCK_DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT = 5;

// use lower limit to avoid slowing down tests
vi.mock('../../constants', () => ({
  DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT: MOCK_DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT,
  DEFAULT_LOGIN_REQUEST_THROTTLER_TTL: 60_000
}));

async function createMockApp() {
  // need to use async import here to apply mocked env every time
  const { ThrottleLoginRequest } = await import('../throttle-login-request.decorator');

  @Controller()
  class AppController {
    @Get()
    @ThrottleLoginRequest()
    get() {
      return { success: true };
    }
  }
  const moduleRef = await Test.createTestingModule({
    controllers: [AppController],
    imports: [
      ThrottlerModule.forRoot([
        {
          limit: 1000,
          name: 'long',
          ttl: 60_000
        }
      ])
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard
      }
    ]
  }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter({}));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

describe('ThrottleLoginRequest', () => {
  let app: NestFastifyApplication;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('should use default values when environment variables are not set', async () => {
    app = await createMockApp();
    for (let i = 0; i < MOCK_DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT; i++) {
      const response = await app.inject({ method: 'GET', url: '/' });
      expect(response.json()).toMatchObject({ success: true });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }
    const response = await app.inject({ method: 'GET', url: '/' });
    expect(response.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);

    vi.advanceTimersByTime(40_000);

    {
      const response = await app.inject({ method: 'GET', url: '/' });
      expect(response.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }

    vi.advanceTimersByTime(40_000);

    {
      const response = await app.inject({ method: 'GET', url: '/' });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }
  });

  it('should use custom values from environment variables', async () => {
    vi.stubEnv('LOGIN_REQUEST_THROTTLER_LIMIT', '3');
    vi.stubEnv('LOGIN_REQUEST_THROTTLER_TTL', '30000');

    app = await createMockApp();

    for (let i = 0; i < 3; i++) {
      const response = await app.inject({ method: 'GET', url: '/' });
      expect(response.json()).toMatchObject({ success: true });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }

    {
      const response = await app.inject({ method: 'GET', url: '/' });
      expect(response.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }

    vi.advanceTimersByTime(15_000);

    {
      const response = await app.inject({ method: 'GET', url: '/' });
      expect(response.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }

    vi.advanceTimersByTime(20_000);

    {
      const response = await app.inject({ method: 'GET', url: '/' });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }

    vi.unstubAllEnvs();
  });
});
