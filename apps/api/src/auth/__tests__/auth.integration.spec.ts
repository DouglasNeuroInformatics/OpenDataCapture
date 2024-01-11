import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AbilityFactory } from '@/ability/ability.factory';
import { UsersService } from '@/users/users.service';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('/auth', () => {
  let app: NestExpressApplication;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AbilityFactory,
          useValue: createMock(AbilityFactory)
        },
        {
          provide: ConfigService,
          useValue: {}
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

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /auth/login', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/auth/login').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request with a username but no password', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin'
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request with a password but no username', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin'
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
