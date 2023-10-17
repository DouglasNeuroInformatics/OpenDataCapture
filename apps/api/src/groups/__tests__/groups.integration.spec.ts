import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { FormInstrument, FormInstrumentStaticFields } from '@open-data-capture/types';
import request from 'supertest';
import type { PartialDeep } from 'type-fest';

import { GroupsController } from '../groups.controller';
import { GroupsRepository } from '../groups.repository';
import { GroupsService } from '../groups.service';

describe('/groups', () => {
  let app: NestExpressApplication;
  let server: unknown;

  let groupsRepository: MockedInstance<GroupsRepository>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        GroupsService,
        {
          provide: GroupsRepository,
          useValue: createMock(GroupsRepository)
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new ValidationPipe());

    groupsRepository = app.get(GroupsRepository);

    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /groups', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/groups').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    // it('should reject a request where name is an empty string', async () => {
    //   const response = await request(server).post('/groups').send({
    //     name: ''
    //   });
    //   expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    // });
  });

  // describe('POST /groups/groups', () => {

  //   });
  //   it('should reject a request with an invalid language', async () => {
  //     const response = await request(server).post('/groups/groups').send({
  //       language: 'foo',
  //       name: 'My Instrument'
  //     });
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should reject a request if one of the language translations is missing', async () => {
  //     const badData = structuredClone(Groups.happinessQuestionnaire) as PartialDeep<
  //       FormInstrument<Groups.HappinessQuestionnaireData> & {
  //         content: FormInstrumentStaticFields<['en', 'fr'], Groups.HappinessQuestionnaireData>;
  //       }
  //     >;
  //     badData.content!.overallHappiness!.label!.fr = undefined;
  //     const response = await request(server).post('/groups/groups').send(badData);
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should return status code 201 when attempting to create the BPRS', async () => {
  //     const response = await request(server).post('/groups/groups').send(Groups.briefPsychiatricRatingScale);
  //     expect(response.status).toBe(HttpStatus.CREATED);
  //   });
  //   it('should return status code 201 when attempting to create the enhanced demographics questionnaire', async () => {
  //     const response = await request(server).post('/groups/groups').send(Groups.enhancedDemographicsQuestionnaire);
  //     console.log(JSON.stringify(response.body, null, 2));
  //     expect(response.status).toBe(HttpStatus.CREATED);
  //   });
  //   it('should return status code 201 when attempting to create the happiness questionnaire', async () => {
  //     const response = await request(server).post('/groups/groups').send(Groups.happinessQuestionnaire);
  //     expect(response.status).toBe(HttpStatus.CREATED);
  //   });
  //   it('should return status code 201 when attempting to create the MMSE', async () => {
  //     const response = await request(server).post('/groups/groups').send(Groups.miniMentalStateExamination);
  //     expect(response.status).toBe(HttpStatus.CREATED);
  //   });
  //   it('should return status code 201 when attempting to create the MoCA', async () => {
  //     const response = await request(server).post('/groups/groups').send(Groups.montrealCognitiveAssessment);
  //     expect(response.status).toBe(HttpStatus.CREATED);
  //   });
  //   it('should pass the DTO through to the repository', async () => {
  //     await request(server).post('/groups/groups').send(Groups.happinessQuestionnaire);
  //     expect(groupsRepository.create.mock.lastCall?.[0]).toMatchObject(Groups.happinessQuestionnaire);
  //   });
  //   it('should return the value returned by the repository', async () => {
  //     groupsRepository.create.mockResolvedValueOnce([1, 2, 3]);
  //     const response = await request(server).post('/groups/groups').send(Groups.happinessQuestionnaire);
  //     expect(response.body).toMatchObject([1, 2, 3]);
  //   });
  // });

  // describe('GET /groups/groups', () => {
  //   it('should return status code 200', async () => {
  //     const response = await request(server).get('/groups/groups');
  //     expect(response.status).toBe(HttpStatus.OK);
  //   });
  //   it('should return all the groups returned by the repository', async () => {
  //     groupsRepository.findAll.mockResolvedValueOnce([{ id: 1 }]);
  //     const response = await request(server).get('/groups/groups');
  //     expect(response.body).toMatchObject([{ id: 1 }]);
  //   });
  // });

  // describe('GET /groups/groups/:id', () => {
  //   it('should reject a request with an invalid id', async () => {
  //     const response = await request(server).get('/groups/groups/123');
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  // });

  afterAll(async () => {
    await app.close();
  });
});
