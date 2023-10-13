import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { happinessQuestionnaire } from '@open-data-capture/instruments';
import request from 'supertest';

import { ValidationPipe } from '@/core/pipes/validation.pipe';

import { InstrumentRepository } from '../instrument.repository';
import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';

describe('InstrumentsModule', () => {
  let app: NestExpressApplication;
  let server: unknown;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [
        InstrumentsService,
        {
          provide: InstrumentRepository,
          useValue: createMock(InstrumentRepository)
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    server = app.getHttpServer();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /instruments/forms', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/instruments/forms').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where name is an empty string', async () => {
      const response = await request(server).post('/instruments/forms').send({
        name: ''
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request with an invalid language', async () => {
      const response = await request(server).post('/instruments/forms').send({
        language: 'foo',
        name: 'My Instrument'
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 201 when attempting to create the happiness questionnaire', async () => {
      const response = await request(server).post('/instruments/forms').send(happinessQuestionnaire);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
