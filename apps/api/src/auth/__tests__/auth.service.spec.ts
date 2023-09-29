import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { beforeEach, describe, expect, it } from 'bun:test';

import { AuthService } from '../auth.service';
import type { LoginRequestDto } from '../dto/login-request.dto';

import { AbilityFactory } from '@/ability/ability.factory';
import { UsersService } from '@/users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: MockedInstance<UsersService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AbilityFactory,
          useValue: createMock(AbilityFactory)
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (propertyPath: string) => propertyPath
          }
        },
        {
          provide: CryptoService,
          useValue: createMock(CryptoService)
        },
        {
          provide: JwtService,
          useValue: createMock(JwtService)
        },
        {
          provide: UsersService,
          useValue: createMock(UsersService)
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
        username: 'admin',
        password: 'Password123'
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
