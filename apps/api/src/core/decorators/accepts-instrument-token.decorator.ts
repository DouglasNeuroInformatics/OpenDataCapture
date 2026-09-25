import { SetMetadata } from '@nestjs/common';

const ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY = 'ODC_ACCEPTS_INSTRUMENT_TOKEN';

/**
 * Admits the reduced token minted by `GET /auth/create-instrument-token` to this route, in addition to
 * a login token that passes its `@RouteAccess`. `JwtAuthGuard` refuses that token everywhere else,
 * the minting route included: it carries the very permission that route requires, so admitting it
 * there would let one token renew itself forever.
 */
export function AcceptsInstrumentToken(): MethodDecorator {
  return SetMetadata(ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY, true);
}

export { ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY };
