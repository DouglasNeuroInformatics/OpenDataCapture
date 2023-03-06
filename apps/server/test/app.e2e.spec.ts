import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from '@/database/database.service';
import { Connection } from 'mongoose';

import { AppModule } from './../src/app.module';
import { UserStubs } from '@/users/test/users.stubs';

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

  await db.collection('users').insertOne(UserStubs.mockSystemAdmin);
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

  it('should reject a request to create a user that already exists', () => {
    const mockSystemAdminDto = Object.assign(UserStubs.mockSystemAdmin, { password: UserStubs.mockPlainTextPassword });
    return request(server).post('/users').send(mockSystemAdminDto).expect(HttpStatus.CONFLICT);
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
