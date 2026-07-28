import { $NumberLike } from '@douglasneuroinformatics/libjs';
import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import z from 'zod/v4';

import { DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT, DEFAULT_LOGIN_REQUEST_THROTTLER_TTL } from '../constants';

// Decorator arguments are evaluated at module load, before the DI container exists, so ConfigService
// is unavailable and these two must be read and validated off process.env by hand.

const LOGIN_REQUEST_THROTTLER_LIMIT = $NumberLike
  .pipe(z.number().int().positive())
  .default(DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT)
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, no-restricted-syntax
  .parse(process.env.LOGIN_REQUEST_THROTTLER_LIMIT || undefined);

const LOGIN_REQUEST_THROTTLER_TTL = $NumberLike
  .pipe(z.number().int().positive())
  .default(DEFAULT_LOGIN_REQUEST_THROTTLER_TTL)
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, no-restricted-syntax
  .parse(process.env.LOGIN_REQUEST_THROTTLER_TTL || undefined);

export function ThrottleLoginRequest() {
  return applyDecorators(
    Throttle({
      long: {
        limit: LOGIN_REQUEST_THROTTLER_LIMIT,
        ttl: LOGIN_REQUEST_THROTTLER_TTL
      }
    })
  );
}
