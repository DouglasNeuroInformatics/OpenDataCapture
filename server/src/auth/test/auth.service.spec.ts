import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';

import { AuthService } from '../auth.service';

import { mockAdmin, mockAdminPlainTextPassword, mockUser } from '@/users/test/stubs/user.stubs';
import { UsersService } from '@/users/users.service';

// this is for both refresh and access tokens
const mockAuthToken = mockAdmin.refreshToken!;

const mockUsers = Object.freeze([mockAdmin, mockUser]);

const MockConfigService = createMock<ConfigService>({
  getOrThrow(property: string) {
    return property;
  }
});

const MockJwtService = createMock<JwtService>({
  signAsync: () => {
    return Promise.resolve(mockAuthToken);
  }
});

const MockUsersService = createMock<UsersService>({
  findUser: (username: string) => {
    const resolvedUser = mockUsers.find((user) => user.username === username);
    if (resolvedUser) {
      return Promise.resolve(resolvedUser);
    }
    throw new NotFoundException();
  }
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: MockConfigService
        },
        {
          provide: JwtService,
          useValue: MockJwtService
        },
        {
          provide: UsersService,
          useValue: MockUsersService
        }
      ]
    }).compile();

    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
  });

  describe('login', () => {
    it('should return tokens and update refresh token if the user provides valid credentials', async () => {
      await expect(
        authService.login({
          username: mockAdmin.username,
          password: mockAdminPlainTextPassword
        })
      ).resolves.toStrictEqual({
        accessToken: mockAuthToken,
        refreshToken: mockAuthToken
      });
      expect(usersService.updateUser).toBeCalledWith(
        mockAdmin.username,
        expect.objectContaining({
          refreshToken: expect.not.stringMatching(mockAuthToken)
        })
      );
    });

    it('should throw an ForbiddenException if the user does not exist', async () => {
      await expect(
        authService.login({
          username: 'attacker',
          password: 'foo'
        })
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw an ForbiddenException if the user provides an incorrect password', async () => {
      await expect(
        authService.login({
          username: mockAdmin.username,
          password: mockAdmin.password + ' '
        })
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('logout', () => {
    it('should call usersService.updateUser and set the refreshToken to undefined', async () => {
      await authService.logout(mockAdmin.username);
      expect(usersService.updateUser).toBeCalledWith(mockAdmin.username, { refreshToken: undefined });
    });

    it('should throw an ForbiddenException if the user does not exist', async () => {
      await expect(authService.logout('foo')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw a BadRequestException if the user does not have a refresh token', async () => {
      await expect(authService.logout('user')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('refresh', () => {
    it('should throw an ForbiddenException if the user does not exist', async () => {
      await expect(authService.refresh('foo', 'token')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
