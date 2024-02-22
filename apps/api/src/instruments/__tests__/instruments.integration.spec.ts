import { ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import {
  briefPsychiatricRatingScale,
  enhancedDemographicsQuestionnaire,
  happinessQuestionnaire,
  miniMentalStateExamination,
  montrealCognitiveAssessment
} from '@open-data-capture/instrument-library';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ConfigurationService } from '@/configuration/configuration.service';
import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';
import { createMockModelProvider } from '@/testing/testing.utils';

import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';

describe('/instruments', () => {
  let app: NestExpressApplication;
  let server: any;

  let instrumentModel: MockedInstance<Model<'Instrument'>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [
        InstrumentsService,
        createMockModelProvider('Instrument'),
        {
          provide: ConfigurationService,
          useValue: createMock(ConfigurationService)
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalPipes(new ValidationPipe());

    instrumentModel = app.get(getModelToken('Instrument'));
    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /instruments', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/instruments').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where name is an empty string', async () => {
      const source = happinessQuestionnaire.source.replace("name: 'HappinessQuestionnaire'", "name: ''");
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should reject a request with an invalid language', async () => {
      const source = happinessQuestionnaire.source.replace("language: ['en', 'fr']", 'language: -1');
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should reject a request if one of the language translations is missing', async () => {
      const source = happinessQuestionnaire.source.replace("fr: 'Questionnaire sur le bonheur'", '');
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should return status code 201 when attempting to create the BPRS', async () => {
      const response = await request(server).post('/instruments').send({ source: briefPsychiatricRatingScale.source });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the enhanced demographics questionnaire', async () => {
      const response = await request(server)
        .post('/instruments')
        .send({ source: enhancedDemographicsQuestionnaire.source });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the happiness questionnaire', async () => {
      const response = await request(server).post('/instruments').send({ source: happinessQuestionnaire.source });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MMSE', async () => {
      const response = await request(server).post('/instruments').send({ source: miniMentalStateExamination.source });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MoCA', async () => {
      const response = await request(server).post('/instruments').send({ source: montrealCognitiveAssessment.source });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('GET /instruments', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/instruments');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return all the instruments returned by the repository', async () => {
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 1, kind: 'FORM' }]);
      const response = await request(server).get('/instruments');
      expect(response.body).toMatchObject([{ id: 1 }]);
    });
  });

  describe('GET /instruments/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new ObjectId().toHexString();
    });
    it('should return status code 200 with a valid ID', async () => {
      instrumentModel.findFirst.mockResolvedValueOnce({ id, kind: 'FORM' });
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the instrument does not exist', async () => {
      instrumentModel.findFirst.mockResolvedValueOnce(null);
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the instrument if it exists', async () => {
      instrumentModel.findFirst.mockResolvedValueOnce({ id, kind: 'FORM' });
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.body).toMatchObject({ id });
    });
  });

  // describe('PATCH /instruments/:id', () => {
  //   let id: string;
  //   beforeAll(() => {
  //     id = new Types.ObjectId().toString();
  //   });

  //   it('should reject a request with an invalid id', async () => {
  //     const response = await request(server).patch('/instruments/123');
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should reject a request to set the instrument name to an empty string', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: '' });
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should reject a request to set the instrument name to a number', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: 100 });
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should return status code 200 with a valid ID, even if nothing is modified', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`);
  //     expect(response.status).toBe(HttpStatus.OK);
  //   });
  //   it('should return status code 200 with a valid ID and valid data', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: 'foo' });
  //     expect(response.status).toBe(HttpStatus.OK);
  //   });
  //   it('should return the modified instrument', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     instrumentsRepository.updateById.mockImplementationOnce((id: string, obj: object) => ({ id, ...obj }));
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: 'foo' });
  //     expect(response.body).toMatchObject({ name: 'foo' });
  //   });
  // });

  afterAll(async () => {
    await app.close();
  });
});
