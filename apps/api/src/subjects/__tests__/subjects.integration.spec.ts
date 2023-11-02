import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { GroupsService } from '@/groups/groups.service';

import { SubjectsController } from '../subjects.controller';
import { SubjectsRepository } from '../subjects.repository';
import { SubjectsService } from '../subjects.service';

describe('/subjects', () => {
  let app: NestExpressApplication;
  let server: unknown;
  let subjectsRepository: MockedInstance<SubjectsRepository>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        SubjectsService,
        {
          provide: CryptoService,
          useValue: createMock(CryptoService)
        },
        {
          provide: GroupsService,
          useValue: createMock(GroupsService)
        },
        {
          provide: SubjectsRepository,
          useValue: createMock(SubjectsRepository)
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new ValidationPipe());

    subjectsRepository = app.get(SubjectsRepository);

    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /subjects', () => {
    let createSubjectDto: Record<string, any>;
    beforeEach(() => {
      createSubjectDto = {
        dateOfBirth: new Date(),
        firstName: 'John',
        lastName: 'Smith',
        sex: 'male'
      };
    });
    it('should return status code 400 for a request with an empty body', async () => {
      const response = await request(server).post('/subjects').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 400 for a request with a non-string value for firstName', async () => {
      const response = await request(server)
        .post('/subjects')
        .send({ ...createSubjectDto, firstName: -1 });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 400 when lastName is an empty string', async () => {
      const response = await request(server)
        .post('/subjects')
        .send({ ...createSubjectDto, lastName: '' });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where the subject already exists', async () => {
      subjectsRepository.exists.mockResolvedValueOnce(true);
      const response = await request(server).post('/subjects').send(createSubjectDto);
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });
    it('should return status code 201 for a properly formulated request', async () => {
      const response = await request(server).post('/subjects').send(createSubjectDto);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('GET /subjects', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/subjects');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return an array of all subjects if no group is provided', async () => {
      subjectsRepository.find.mockResolvedValueOnce([{ name: 'foo' }]);
      const response = await request(server).get('/subjects');
      expect(response.body).toMatchObject([{ name: 'foo' }]);
    });
  });

  describe('GET /subjects/:id', () => {
    it('should return status code 200 with a valid ID', async () => {
      subjectsRepository.findOne.mockResolvedValueOnce({ name: 'foo' });
      const response = await request(server).get('/subjects/123');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the subject does not exist', async () => {
      subjectsRepository.findOne.mockResolvedValueOnce(null);
      const response = await request(server).get(`/subjects/123`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the subject if it exists', async () => {
      subjectsRepository.findOne.mockResolvedValueOnce({ name: 'foo' });
      const response = await request(server).get('/subjects/123');
      expect(response.body).toMatchObject({ name: 'foo' });
    });
  });

  describe('DELETE /subjects/:id', () => {
    it('should return status code 200 with a valid ID', async () => {
      subjectsRepository.findOne.mockResolvedValue({});
      const response = await request(server).delete('/subjects/123');
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
