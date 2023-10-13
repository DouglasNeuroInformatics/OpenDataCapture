import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { InstrumentRepository } from '../instrument.repository';
import { InstrumentsModule } from '../instruments.module';
import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';
import { createMock } from '@douglasneuroinformatics/nestjs/testing';

describe('/instruments', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });
});
