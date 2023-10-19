import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

//import { HttpStatus } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import mongoose, { mongo } from 'mongoose';
import request from 'supertest';

import { AppModule } from '@/app.module';

let app: NestExpressApplication;
let server: any;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider('DatabaseConnection')
    .useValue(mongoose.connection)
    .compile();

  app = moduleRef.createNestApplication({
    logger: ['debug', 'error', 'fatal', 'log', 'verbose', 'warn']
  });

  // connection = app.get(getConnectionToken());

  await app.init();
  server = app.getHttpServer();

  // if (connection.db.databaseName === 'data-capture-testing') {
  //   await connection.db.dropDatabase();
  // } else {
  //   throw new Error(`Unexpected database name: ${connection.db.databaseName}`);
  // }
});

describe('App', () => {
  describe('Setup Procedure', () => {
    it('should initially not be setup', async () => {
      const response = await request(server).get('/setup');
      // console.log(response, 'Res');
      expect(response).toBeDefined();
    });
  });
});

afterAll(async () => {
  await app.close();
  await mongoose.disconnect();
});
