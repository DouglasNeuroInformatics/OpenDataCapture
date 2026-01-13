import { $NumberLike } from '@douglasneuroinformatics/libjs';
import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import z from 'zod/v4';

// we cannot inject the config service here, so this needs to be parsed manually

const LOGIN_REQUEST_THROTTLER_LIMIT = $NumberLike
  .pipe(z.number().int().positive())
  .default(50)
  .parse(process.env.LOGIN_REQUEST_THROTTLER_LIMIT);

const LOGIN_REQUEST_THROTTLER_TTL = $NumberLike
  .pipe(z.number().int().positive())
  .default(60_000)
  .parse(process.env.LOGIN_REQUEST_THROTTLER_TTL);

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
