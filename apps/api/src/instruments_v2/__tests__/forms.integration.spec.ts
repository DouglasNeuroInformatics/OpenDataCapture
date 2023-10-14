import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as Instruments from '@open-data-capture/instruments';
import type { FormInstrument, FormInstrumentStaticFields } from '@open-data-capture/types';
import request from 'supertest';
import type { PartialDeep } from 'type-fest';

import { FormsController } from '../controllers/forms.controller';
import { InstrumentRepository } from '../repositories/instrument.repository';
import { FormsService } from '../services/forms.service';

describe('/instruments/forms', () => {
  let app: NestExpressApplication;
  let server: unknown;

  let instrumentsRepository: MockedInstance<InstrumentRepository>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FormsController],
      providers: [
        FormsService,
        {
          provide: InstrumentRepository,
          useValue: createMock(InstrumentRepository)
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new ValidationPipe());

    instrumentsRepository = app.get(InstrumentRepository);

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
      const response = await request(server).post('/instruments/forms').send({
        language: 'foo',
        name: 'My Instrument'
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request if one of the language translations is missing', async () => {
      const badData = structuredClone(Instruments.happinessQuestionnaire) as PartialDeep<
        FormInstrument<Instruments.HappinessQuestionnaireData> & {
          content: FormInstrumentStaticFields<['en', 'fr'], Instruments.HappinessQuestionnaireData>;
        }
      >;
      badData.content!.overallHappiness!.label!.fr = undefined;
      const response = await request(server).post('/instruments/forms').send(badData);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 201 when attempting to create the BPRS', async () => {
      const response = await request(server).post('/instruments/forms').send(Instruments.briefPsychiatricRatingScale);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the enhanced demographics questionnaire', async () => {
      const response = await request(server)
        .post('/instruments/forms')
        .send(Instruments.enhancedDemographicsQuestionnaire);
      console.log(JSON.stringify(response.body, null, 2));
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the happiness questionnaire', async () => {
      const response = await request(server).post('/instruments/forms').send(Instruments.happinessQuestionnaire);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MMSE', async () => {
      const response = await request(server).post('/instruments/forms').send(Instruments.miniMentalStateExamination);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MoCA', async () => {
      const response = await request(server).post('/instruments/forms').send(Instruments.montrealCognitiveAssessment);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should pass the DTO through to the repository', async () => {
      await request(server).post('/instruments/forms').send(Instruments.happinessQuestionnaire);
      expect(instrumentsRepository.create.mock.lastCall?.[0]).toMatchObject(Instruments.happinessQuestionnaire);
    });
    it('should return the value returned by the repository', async () => {
      instrumentsRepository.create.mockResolvedValueOnce([1, 2, 3]);
      const response = await request(server).post('/instruments/forms').send(Instruments.happinessQuestionnaire);
      expect(response.body).toMatchObject([1, 2, 3]);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
