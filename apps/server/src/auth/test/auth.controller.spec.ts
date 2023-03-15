import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

import { MockAuthService } from './mocks/auth.service.mock';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: MockAuthService
        }
      ]
    }).compile();

    authController = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token and refresh token', async () => {
      await expect(authController.login({ username: 'user', password: 'password' })).resolves.toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      });
    });
  });
});
