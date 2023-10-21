import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as instruments from '@open-data-capture/instruments';
import { Types } from 'mongoose';
import request from 'supertest';

import { FormsController } from '../forms.controller';
import { FormsService } from '../forms.service';
import { InstrumentsRepository } from '../instruments.repository';

describe('/instruments/forms', () => {
  let app: NestExpressApplication;
  let server: unknown;

  let instrumentsRepository: MockedInstance<InstrumentsRepository>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FormsController],
      providers: [
        FormsService,
        {
          provide: InstrumentsRepository,
          useValue: createMock(InstrumentsRepository)
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new ValidationPipe());

    instrumentsRepository = app.get(InstrumentsRepository);

    await app.init();
    server = app.getHttpServer();
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
      const data = Object.assign(structuredClone(instruments.happinessQuestionnaire), {
        language: 'foo'
      });
      const response = await request(server).post('/instruments/forms').send(data);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request if one of the language translations is missing', async () => {
      const data: Record<string, any> = structuredClone(instruments.happinessQuestionnaire);
      data.content.overallHappiness.label.fr = undefined;
      const response = await request(server).post('/instruments/forms').send(data);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 201 when attempting to create the BPRS', async () => {
      const response = await request(server).post('/instruments/forms').send(instruments.briefPsychiatricRatingScale);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the enhanced demographics questionnaire', async () => {
      const response = await request(server)
        .post('/instruments/forms')
        .send(instruments.enhancedDemographicsQuestionnaire);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the happiness questionnaire', async () => {
      const response = await request(server).post('/instruments/forms').send(instruments.happinessQuestionnaire);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MMSE', async () => {
      const response = await request(server).post('/instruments/forms').send(instruments.miniMentalStateExamination);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MoCA', async () => {
      const response = await request(server).post('/instruments/forms').send(instruments.montrealCognitiveAssessment);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should pass the DTO through to the repository', async () => {
      await request(server).post('/instruments/forms').send(instruments.happinessQuestionnaire);
      expect(instrumentsRepository.create.mock.lastCall?.[0]).toMatchObject(instruments.happinessQuestionnaire);
    });
    it('should return the value returned by the repository', async () => {
      instrumentsRepository.create.mockResolvedValueOnce([1, 2, 3]);
      const response = await request(server).post('/instruments/forms').send(instruments.happinessQuestionnaire);
      expect(response.body).toMatchObject([1, 2, 3]);
    });
  });

  describe('GET /instruments/forms', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/instruments/forms');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return all the instruments returned by the repository', async () => {
      instrumentsRepository.find.mockResolvedValueOnce([{ id: 1, kind: 'form' }]);
      const response = await request(server).get('/instruments/forms');
      expect(response.body).toMatchObject([{ id: 1 }]);
    });
  });

  describe('GET /instruments/forms/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });

    it('should reject a request with an invalid id', async () => {
      const response = await request(server).get('/instruments/forms/123');
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).get(`/instruments/forms/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the instrument exists, but is not a form', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'other' });
      const response = await request(server).get(`/instruments/forms/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should throw a not found exception if the form does not exist', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce(null);
      const response = await request(server).get(`/instruments/forms/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the form if it exists', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).get(`/instruments/forms/${id}`);
      expect(response.body).toMatchObject({ id });
    });
  });

  describe('PATCH /instruments/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });

    it('should reject a request with an invalid id', async () => {
      const response = await request(server).patch('/instruments/forms/123');
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request to set the instrument name to an empty string', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).patch(`/instruments/forms/${id}`).send({ name: '' });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request to set the instrument name to a number', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).patch(`/instruments/forms/${id}`).send({ name: 100 });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID, even if nothing is modified', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).patch(`/instruments/forms/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return status code 200 with a valid ID and valid data', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      const response = await request(server).patch(`/instruments/forms/${id}`).send({ name: 'foo' });
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return the modified instrument', async () => {
      instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'form' });
      instrumentsRepository.updateById.mockImplementationOnce((id: string, obj: object) => ({ id, ...obj }));
      const response = await request(server).patch(`/instruments/forms/${id}`).send({ name: 'foo' });
      expect(response.body).toMatchObject({ name: 'foo' });
    });
  });

  describe('DELETE /instruments/forms/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });

    it('should reject a request with an invalid id', async () => {
      const response = await request(server).delete('/instruments/forms/123');
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID', async () => {
      const response = await request(server).delete(`/instruments/forms/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
