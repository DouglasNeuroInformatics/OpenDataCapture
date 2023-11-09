import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';

import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { InstrumentTransformer } from '@open-data-capture/common/instrument';
import { happinessQuestionnaire } from '@open-data-capture/instruments/raw';
import request from 'supertest';

import { AppModule } from '@/app.module';

import type { CreateAssignmentBundleDto } from './assignments/dto/create-assignment-bundle.dto';

let app: NestExpressApplication;
let server: unknown;

const instrumentTransformer = new InstrumentTransformer();
const happinessQuestionnaireBundle = instrumentTransformer.generateBundle(happinessQuestionnaire);

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
  let createAssignmentBundleDto: CreateAssignmentBundleDto;

  beforeEach(() => {
    createAssignmentBundleDto = {
      expiresAt: new Date(Date.now() + 604800000), // 1 week,
      instrumentBundle: happinessQuestionnaireBundle,
      instrumentId: '12345',
      subjectIdentifier: '12345'
    };
  });

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
    it('should return status code 201 when sent valid data', async () => {
      const response = await request(server).post('/assignments').send(createAssignmentBundleDto);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });
});

afterAll(async () => {
  await app.close();
});
