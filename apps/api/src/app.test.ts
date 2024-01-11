import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/app.module';

import { PrismaService } from './prisma/prisma.service';

let app: NestExpressApplication;
let prismaService: PrismaService;
let server: any;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleRef.createNestApplication({
    logger: ['debug', 'error', 'fatal', 'log', 'verbose', 'warn']
  });

  await app.init();
  prismaService = app.get(PrismaService);
  server = app.getHttpServer();
});

describe('App', () => {
  describe('Setup Procedure', () => {
    it('should initially not be setup', async () => {
      const response = await request(server).get('/setup');
      expect(response).toBeDefined();
    });
  });
});

afterAll(async () => {
  const result = await prismaService.client.$runCommandRaw({ getName: 1 });
  console.log(result);
  // await client.$runCommandRaw({ dropDatabase: 1 });
  // if (connection.db.databaseName === 'data-capture-testing') {
  //   await connection.db.dropDatabase();
  // } else {
  //   throw new Error(`Unexpected database name: ${connection.db.databaseName}`);
  // }
  await app.close();
  app.flushLogs();
});
