import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Connection } from 'mongoose';

import { AppModule } from '@/app.module';
import { DatabaseService } from '@/database/database.service';
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

export { app, db, server };
