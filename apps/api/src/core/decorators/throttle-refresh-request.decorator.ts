import { applyDecorators } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod/v4';

import { REFRESH_REQUEST_THROTTLER_LONG_LIMIT, REFRESH_REQUEST_THROTTLER_MEDIUM_LIMIT } from '../constants';

const $UnverifiedTokenPayload = z.object({ id: z.string().min(1) });

const BEARER_TOKEN_PAYLOAD = /^bearer\s+[^.\s]+\.([^.\s]+)\.[^.\s]+$/i;

function readUnverifiedUserId(authorization: string | undefined): null | string {
  const encodedPayload = authorization?.match(BEARER_TOKEN_PAYLOAD)?.[1];
  if (!encodedPayload) {
    return null;
  }
  try {
    const payload: unknown = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    return $UnverifiedTokenPayload.parse(payload).id;
  } catch {
    // Anything that is not a token is counted against its address below, and then refused by the guard.
    return null;
  }
}

/**
 * The throttler guard is registered ahead of `JwtAuthGuard`, so `request.user` does not exist yet and
 * the id is read off the token before anyone has verified it. A forged id is therefore paired with
 * the address it came from: forging one spends the limit of that user at that address and of nobody
 * else, which is no more than the forger could do to every route by address alone.
 */
function getUserTracker(_request: unknown, context: ExecutionContext): string {
  // The throttler hands over this same request as its first argument, typed as a record of `any`.
  const request = context.switchToHttp().getRequest<FastifyRequest>();
  const userId = readUnverifiedUserId(request.headers.authorization);
  return userId === null ? request.ip : `${request.ip}:${userId}`;
}

/**
 * Every web tab renews its token up to once a minute, and a hospital reaches the api from one
 * address, so the limits libnest counts per address would be spent by a few hundred people working
 * normally. The ten-second and one-minute windows are counted per user instead. The one-second
 * window is left as libnest sets it, per address: it is what bounds requests carrying no token to
 * count by.
 */
export function ThrottleRefreshRequest() {
  return applyDecorators(
    Throttle({
      long: { getTracker: getUserTracker, limit: REFRESH_REQUEST_THROTTLER_LONG_LIMIT },
      medium: { getTracker: getUserTracker, limit: REFRESH_REQUEST_THROTTLER_MEDIUM_LIMIT }
    })
  );
}
