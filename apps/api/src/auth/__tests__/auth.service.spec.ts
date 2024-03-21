import { CryptoService } from '@douglasneuroinformatics/libnest/modules';
import { MockFactory, type MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AbilityFactory } from '@/ability/ability.factory';
import { ConfigurationService } from '@/configuration/configuration.service';
import { UsersService } from '@/users/users.service';

import { AuthService } from '../auth.service';

import type { LoginRequestDto } from '../dto/login-request.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: MockedInstance<UsersService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        MockFactory.createForService(AbilityFactory),
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(JwtService),
        MockFactory.createForService(UsersService),
        {
          provide: ConfigurationService,
          useValue: {
            get: (propertyPath: string) => propertyPath
          }
        }
      ]
    }).compile();
    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    let loginRequest: LoginRequestDto;

    beforeEach(() => {
      loginRequest = Object.freeze({
        password: 'Password123',
        username: 'admin'
      });
    });

    it('should raise an `UnauthorizedException` if the `UsersService` throws a `NotFoundException', () => {
      usersService.findByUsername.mockRejectedValueOnce(new NotFoundException());
      expect(authService.login(loginRequest.username, loginRequest.password)).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    // it('should throw an `UnauthorizedException` if the `CryptoService` returns that the password does not match', () => {
    //   cryptoService.comparePassword.mockResolvedValueOnce(false);
    //   usersService.
    //   expect(authService.login(loginRequest.username, loginRequest.password)).rejects.toBeInstanceOf(
    //     UnauthorizedException
    //   );
    // });
  });
});
