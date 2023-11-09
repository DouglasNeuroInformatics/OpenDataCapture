import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
// import { InstrumentTransformer } from '@open-data-capture/common/instrument';
import request from 'supertest';

import { AppModule } from '@/app.module';

let app: NestExpressApplication;
let server: unknown;

// const instrumentTransformer = new InstrumentTransformer();

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleRef.createNestApplication({
    logger: ['debug', 'error', 'fatal', 'log', 'verbose', 'warn']
  });

  await app.init();
  server = app.getHttpServer();
});

describe('App', () => {
  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});

describe('/assignments', () => {
  describe('GET /assignments', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/assignments');
      expect(response.status).toBe(HttpStatus.OK);
    });
  });
  describe('POST /assignments', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/assignments').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});

afterAll(async () => {
  await app.close();
});
