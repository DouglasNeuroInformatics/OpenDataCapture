import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { DatabaseRepository, type Repository, getRepositoryToken } from '@douglasneuroinformatics/nestjs/modules';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { importInstrumentSource } from '@open-data-capture/instruments/macros' with { type: 'macro' }
import { Types } from 'mongoose';
import request from 'supertest';

import { InstrumentEntity } from '../entities/instrument.entity';
import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';

const BPRS_SOURCE = importInstrumentSource('forms/brief-psychiatric-rating-scale');
const EDQ_SOURCE = importInstrumentSource('forms/enhanced-demographics-questionnaire');
const HQ_SOURCE = importInstrumentSource('forms/happiness-questionnaire');
const MMSE_SOURCE = importInstrumentSource('forms/mini-mental-state-examination');
const MOCA_SOURCE = importInstrumentSource('forms/montreal-cognitive-assessment');

describe('/instruments', () => {
  let app: NestExpressApplication;
  let server: unknown;

  let instrumentsRepository: MockedInstance<Repository<InstrumentEntity>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [
        InstrumentsService,
        {
          provide: getRepositoryToken(InstrumentEntity),
          useValue: createMock(DatabaseRepository(InstrumentEntity))
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new ValidationPipe());

    instrumentsRepository = app.get(getRepositoryToken(InstrumentEntity));
    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /instruments', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/instruments').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where name is an empty string', async () => {
      const source = HQ_SOURCE.replace("name: 'HappinessQuestionnaire'", "name: ''");
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should reject a request with an invalid language', async () => {
      const source = HQ_SOURCE.replace("language: ['en', 'fr']", 'language: -1');
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should reject a request if one of the language translations is missing', async () => {
      const source = HQ_SOURCE.replace("fr: 'Questionnaire sur le bonheur'", '');
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should return status code 201 when attempting to create the BPRS', async () => {
      const response = await request(server).post('/instruments').send({ source: BPRS_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the enhanced demographics questionnaire', async () => {
      const response = await request(server).post('/instruments').send({ source: EDQ_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the happiness questionnaire', async () => {
      const response = await request(server).post('/instruments').send({ source: HQ_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MMSE', async () => {
      const response = await request(server).post('/instruments').send({ source: MMSE_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MoCA', async () => {
      const response = await request(server).post('/instruments').send({ source: MOCA_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('GET /instruments', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/instruments');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return all the instruments returned by the repository', async () => {
      instrumentsRepository.find.mockResolvedValueOnce([{ id: 1, kind: 'form' }]);
      const response = await request(server).get('/instruments');
      expect(response.body).toMatchObject([{ id: 1 }]);
    });
  });

  describe('GET /instruments/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });

    it('should reject a request with an invalid id', async () => {
      const response = await request(server).get('/instruments/123');
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the instrument does not exist', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce(null);
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the instrument if it exists', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.body).toMatchObject({ id });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
