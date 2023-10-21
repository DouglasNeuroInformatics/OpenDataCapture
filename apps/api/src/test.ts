import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

//import { HttpStatus } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import request from 'supertest';

import { AppModule } from '@/app.module';

let app: NestExpressApplication;
let connection: Connection;
let server: any;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleRef.createNestApplication({
    logger: ['debug', 'error', 'fatal', 'log', 'verbose', 'warn']
  });

  await app.init();
  connection = app.get(getConnectionToken());
  server = app.getHttpServer();
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
  if (connection.db.databaseName === 'data-capture-testing') {
    await connection.db.dropDatabase();
  } else {
    throw new Error(`Unexpected database name: ${connection.db.databaseName}`);
  }
  await app.close();
  app.flushLogs();
});
