import { ValidationPipe } from '@douglasneuroinformatics/libnest/core';
import { CryptoService } from '@douglasneuroinformatics/libnest/modules';
import { MockFactory, type MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { SubjectIdentificationData } from '@open-data-capture/common/subject';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';

import { SubjectsController } from '../subjects.controller';
import { SubjectsService } from '../subjects.service';

describe('/subjects', () => {
  let app: NestExpressApplication;
  let server: any;

  let subjectModel: MockedInstance<Model<'Subject'>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        SubjectsService,
        MockFactory.createForModelToken(getModelToken('Subject')),
        MockFactory.createForService(CryptoService)
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalPipes(new ValidationPipe());

    subjectModel = app.get(getModelToken('Subject'));

    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /subjects', () => {
    let createSubjectDto: SubjectIdentificationData;
    beforeEach(() => {
      createSubjectDto = {
        dateOfBirth: new Date(),
        firstName: 'John',
        lastName: 'Smith',
        sex: 'MALE'
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
      subjectModel.exists.mockResolvedValueOnce(true);
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
      subjectModel.findMany.mockResolvedValueOnce([{ id: '123' }]);
      const response = await request(server).get('/subjects');
      expect(response.body).toMatchObject([{ id: '123' }]);
    });
  });

  describe('GET /subjects/:id', () => {
    it('should return status code 200 with a valid ID', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      const response = await request(server).get('/subjects/123');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the subject does not exist', async () => {
      subjectModel.findFirst.mockResolvedValueOnce(null);
      const response = await request(server).get(`/subjects/123`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the subject if it exists', async () => {
      subjectModel.findFirst.mockResolvedValueOnce({ id: '123' });
      const response = await request(server).get('/subjects/123');
      expect(response.body).toMatchObject({ id: '123' });
    });
  });

  describe('DELETE /subjects/:id', () => {
    it('should return status code 200 with a valid ID', async () => {
      subjectModel.findFirst.mockResolvedValue({});
      const response = await request(server).delete('/subjects/123');
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
