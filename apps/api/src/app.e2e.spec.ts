import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

//import { HttpStatus } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
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

  connection = app.get(getConnectionToken());

  await app.init();
  server = app.getHttpServer();

  if (connection.db.databaseName === 'data-capture-testing') {
    await connection.db.dropDatabase();
  } else {
    throw new Error(`Unexpected database name: ${connection.db.databaseName}`);
  }
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

afterAll(async (done) => {
  await app.close();
  await connection.destroy(true);
  done();

  // process.exit(0);
  // process.exit(0); // Not sure why this is necessary
});
