import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from '@/database/database.service';
import { Connection } from 'mongoose';

let app: NestExpressApplication;
let db: Connection;
let server: any;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  db = moduleFixture.get(DatabaseService).getDbHandle();
  server = app.getHttpServer();
});

afterAll(async () => {
  if (db.name !== 'test') {
    throw new Error(`Unexpected database name ${db.name}`);
  }
  await db.dropDatabase();
  await app.close();
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
