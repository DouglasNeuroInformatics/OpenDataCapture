import { $NumberLike } from '@douglasneuroinformatics/libjs';
import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import z from 'zod/v4';

import { DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT, DEFAULT_LOGIN_REQUEST_THROTTLER_TTL } from '../constants';

// we cannot inject the config service here, so this needs to be parsed manually

const LOGIN_REQUEST_THROTTLER_LIMIT = $NumberLike
  .pipe(z.number().int().positive())
  .default(DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT)
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  .parse(process.env.LOGIN_REQUEST_THROTTLER_LIMIT || undefined);

const LOGIN_REQUEST_THROTTLER_TTL = $NumberLike
  .pipe(z.number().int().positive())
  .default(DEFAULT_LOGIN_REQUEST_THROTTLER_TTL)
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
