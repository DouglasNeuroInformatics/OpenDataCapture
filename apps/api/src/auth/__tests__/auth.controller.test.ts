import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY } from '@/core/decorators/accepts-instrument-token.decorator';

import { createAppAbility } from '../ability.utils.js';
import { AuthController } from '../auth.controller.js';
import { AuthService } from '../auth.service.js';

const currentUser: RequestUser = {
  ability: createAppAbility([{ action: 'manage', subject: 'Instrument' }]),
  basePermissionLevel: 'ADMIN',
  firstName: 'Test',
  groups: [],
  id: 'user-1',
  kind: 'login',
  lastName: 'User',
  mustResetPassword: false,
  permissions: [{ action: 'manage', groupId: null, subject: 'Instrument' }],
  username: 'test-user'
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: MockedInstance<AuthService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [MockFactory.createForService(AuthService)]
    }).compile();
    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
  });

  // The minting route requires the very permission it hands out, so the guard's refusal of an
  // instrument token on unmarked routes is all that stops a minted token renewing itself.
  it('should not accept an instrument token on the minting route, so a minted token expires when it says', () => {
    const accepts = new Reflector().get<true | undefined>(
      ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY,
      Object.getOwnPropertyDescriptor(AuthController.prototype, 'getCreateInstrumentToken')!.value
    );
    expect(accepts).toBeUndefined();
  });

  describe('getCreateInstrumentToken', () => {
    it('should mint the token for the current user, so the service can check that user may create instruments', async () => {
      authService.getCreateInstrumentToken.mockResolvedValueOnce({ accessToken: '__TOKEN__' });
      await expect(authController.getCreateInstrumentToken(currentUser)).resolves.toStrictEqual({
        accessToken: '__TOKEN__'
      });
      expect(authService.getCreateInstrumentToken).toHaveBeenCalledExactlyOnceWith(currentUser);
    });
  });

  // Renewing an instrument token would let the playground's copy outlive the hour it is minted for.
  it('should not accept an instrument token on the refresh route, so only a login token can be renewed', () => {
    const accepts = new Reflector().get<true | undefined>(
      ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY,
      Object.getOwnPropertyDescriptor(AuthController.prototype, 'refresh')!.value
    );
    expect(accepts).toBeUndefined();
  });

  describe('login', () => {
    const credentials = { password: 'secret', username: 'test-user' };

    it('should exchange the submitted credentials for the access token the service issues', async () => {
      authService.login.mockResolvedValueOnce({ accessToken: '__TOKEN__' });
      await expect(authController.login(credentials, undefined)).resolves.toStrictEqual({ accessToken: '__TOKEN__' });
    });

    it.each([
      { header: undefined, isInteractive: false },
      { header: 'false', isInteractive: false },
      { header: 'yes', isInteractive: false },
      { header: 'true', isInteractive: true }
    ])(
      'should sign in with isInteractive $isInteractive when the header is $header, so only a client that asks gets the shorter lifetime',
      async ({ header, isInteractive }) => {
        await authController.login(credentials, header);
        expect(authService.login).toHaveBeenCalledExactlyOnceWith(credentials, { isInteractive });
      }
    );
  });

  describe('refresh', () => {
    it('should renew the token of the current user', async () => {
      authService.refresh.mockResolvedValueOnce({ accessToken: '__TOKEN__' });
      await expect(authController.refresh(currentUser)).resolves.toStrictEqual({ accessToken: '__TOKEN__' });
      expect(authService.refresh).toHaveBeenCalledExactlyOnceWith(currentUser);
    });
  });
});
