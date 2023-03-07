import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Connection } from 'mongoose';

import { AppModule } from '@/app.module';
import { DatabaseService } from '@/database/database.service';
import { UserStubs } from '@/users/test/users.stubs';

const mockUsers = Object.freeze([UserStubs.mockSystemAdmin, UserStubs.mockGroupManager, UserStubs.mockStandardUser]);

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

beforeEach(async () => {
  await db.collection('users').insertMany(structuredClone([...mockUsers]));
});

afterEach(async () => {
  if (db.name !== 'test') {
    throw new Error(`Unexpected database name ${db.name}`);
  }
  await db.dropCollection('users');
});

afterAll(async () => {
  await app.close();
});

export { app, db, mockUsers, server };
