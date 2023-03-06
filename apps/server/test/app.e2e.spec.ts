import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpStatus } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /users', () => {
    it('should reject a request with an empty body', () => {
      return request(server).post('/users').send().expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject a request to create a user with an invalid role', () => {
      return request(server)
        .post('/users')
        .send({
          username: 'user',
          password: 'Password123',
          role: 'sudo'
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject a request to create a user with a weak password', () => {
      return request(server)
        .post('/users')
        .send({
          username: 'user',
          password: 'password',
          role: 'standard-user'
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create a new user when the correct data is provided', () => {
      return request(server)
        .post('/users')
        .send({
          username: 'user',
          password: 'Password123',
          role: 'standard-user'
        })
        .expect(HttpStatus.CREATED);
    });
  });
});
