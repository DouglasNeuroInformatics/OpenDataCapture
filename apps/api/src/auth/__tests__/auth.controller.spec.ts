import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY } from '@/core/decorators/accepts-instrument-token.decorator';

import { AuthController } from '../auth.controller.js';

describe('AuthController', () => {
  // The minting route requires the very permission it hands out, so the guard's refusal of an
  // instrument token on unmarked routes is all that stops a minted token renewing itself.
  it('should not accept an instrument token on the minting route, so a minted token expires when it says', () => {
    const accepts = new Reflector().get<true | undefined>(
      ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY,
      Object.getOwnPropertyDescriptor(AuthController.prototype, 'getCreateInstrumentToken')!.value
    );
    expect(accepts).toBeUndefined();
  });
});
