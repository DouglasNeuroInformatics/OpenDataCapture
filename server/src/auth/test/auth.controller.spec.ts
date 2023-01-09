import { Test } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

import { mockAdmin, mockAdminPlainTextPassword } from '@/users/test/stubs/user.stubs';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        }
      ]
    }).compile();

    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      await authController.login({
        username: mockAdmin.username,
        password: mockAdminPlainTextPassword
      });
      expect(authService.login).toBeCalled();
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      await authController.logout(mockAdmin.username);
      expect(authService.logout).toBeCalledWith(mockAdmin.username);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh', async () => {
      await authController.refresh(mockAdmin.username, mockAdmin.refreshToken!);
      expect(authService.refresh).toBeCalledWith(mockAdmin.username, mockAdmin.refreshToken!);
    });
  });
});
