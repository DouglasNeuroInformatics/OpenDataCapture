import { beforeAll, describe, expect, it, afterAll } from 'bun:test';

import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@/app.module';
import { SetupService } from '@/setup/setup.service';

describe('/auth', () => {
  let app: NestExpressApplication;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    await app.init();
    server = app.getHttpServer();

    const setupService = app.get(SetupService);
    await setupService.dropDatabase();
    await setupService.createAdmin({
      username: 'admin',
      password: 'Password123'
    });
  });

  describe('POST /auth/login', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/auth/login').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    });
    it('should reject a request with a valid username but no password', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin'
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    });
    it('should reject a request that contains an invalid password', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin',
        password: 'foo'
      });
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      expect(response.body.message).toMatch('Invalid password')
    });
    it('should return a JSON web token when provided the correct credentials', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin',
        password: 'Password123'
      });
      expect(response.status).toBe(HttpStatus.OK)
      expect(typeof response.body.accessToken === 'string').toBeTrue()
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
