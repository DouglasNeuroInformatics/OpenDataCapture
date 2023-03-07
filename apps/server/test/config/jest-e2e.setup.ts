import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Connection } from 'mongoose';

import { AppModule } from '@/app.module';
import { DatabaseService } from '@/database/database.service';

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
  await app.close();
});

export { app, db, server };
