import { MockFactory, type MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

import type { LoginRequestDto } from '../dto/login-request.dto';

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

  describe('login', () => {
    let loginRequest: LoginRequestDto;

    beforeEach(() => {
      loginRequest = Object.freeze({
        password: 'Password123',
        username: 'admin'
      });
    });

    it('should call the `AuthService` with a username and password', async () => {
      await authController.login(loginRequest);
      expect(authService.login.mock.lastCall).toMatchObject([loginRequest.username, loginRequest.password]);
    });

    it('should return the same value returned by `AuthService`', async () => {
      authService.login.mockResolvedValueOnce({ accessToken: '123' });
      const returnValue = await authController.login(loginRequest);
      expect(returnValue).toMatchObject({ accessToken: '123' });
    });
  });
});
