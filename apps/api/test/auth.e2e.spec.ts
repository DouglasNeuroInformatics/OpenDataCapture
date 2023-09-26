import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@/app.module';
import { SetupService } from '@/setup/setup.service';

describe('/auth', () => {
  let app: NestExpressApplication;
  let server: any;

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication({
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
      assert.strictEqual(response.status, HttpStatus.BAD_REQUEST);
    });
    it('should reject a request with a valid username but no password', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin'
      });
      assert.strictEqual(response.status, HttpStatus.BAD_REQUEST);
    });
    it('should reject a request that contains an invalid password', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin',
        password: 'foo'
      });
      assert.strictEqual(response.status, HttpStatus.UNAUTHORIZED);
      assert.strictEqual(response.body.message, 'Invalid password');
    });
    it('should return a JSON web token when provided the correct credentials', async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'admin',
        password: 'Password123'
      });
      assert.strictEqual(response.status, HttpStatus.OK);
      assert(typeof response.body.accessToken === 'string');
    });
  });

  after(async () => {
    await app.close();
  });
});
