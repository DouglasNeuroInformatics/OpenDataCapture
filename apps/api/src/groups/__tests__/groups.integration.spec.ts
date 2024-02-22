import { ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { HttpStatus } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';
import { type MockedInstance } from '@/testing/testing.utils';
import { createMockModelProvider } from '@/testing/testing.utils';

import { GroupsController } from '../groups.controller';
import { GroupsService } from '../groups.service';

describe('/groups', () => {
  let app: NestExpressApplication;
  let server: any;

  let groupModel: MockedInstance<Model<'Group'>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [GroupsService, createMockModelProvider('Group')]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalPipes(new ValidationPipe());

    groupModel = app.get(getModelToken('Group'));

    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /groups', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/groups').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where name is an empty string', async () => {
      const response = await request(server).post('/groups').send({ name: '' });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where the group already exists', async () => {
      groupModel.exists.mockResolvedValueOnce(true);
      const response = await request(server).post('/groups').send({ name: 'foo' });
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });
    it('should return status code 201 if successful', async () => {
      const response = await request(server).post('/groups').send({ name: 'foo' });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('GET /groups', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/groups');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return an array of all groups', async () => {
      groupModel.findMany.mockResolvedValueOnce([{ name: 'foo' }]);
      const response = await request(server).get('/groups');
      expect(response.body).toMatchObject([{ name: 'foo' }]);
    });
  });

  describe('GET /groups/:id', () => {
    let id: string;

    beforeEach(() => {
      id = new ObjectId().toHexString();
    });
    it('should return status code 200 with a valid ID', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).get(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the group does not exist', async () => {
      groupModel.findFirst.mockResolvedValueOnce(null);
      const response = await request(server).get(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the group if it exists', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).get(`/groups/${id}`);
      expect(response.body).toMatchObject({ id });
    });
  });

  describe('PATCH /groups/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new ObjectId().toHexString();
    });
    it('should reject a request to set the group name to an empty string', async () => {
      const response = await request(server).patch(`/groups/${id}`).send({ name: '' });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request to set the group name to a number', async () => {
      const response = await request(server).patch(`/groups/${id}`).send({ name: 100 });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID, even if nothing is modified', async () => {
      groupModel.update.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return status code 200 with a valid ID and valid data', async () => {
      groupModel.update.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/groups/${id}`).send({ name: 'foo' });
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return the modified group', async () => {
      groupModel.update.mockImplementationOnce((obj: Record<string, any>) => obj.data);
      const response = await request(server).patch(`/groups/${id}`).send({ name: 'foo' });
      expect(response.body).toMatchObject({ name: 'foo' });
    });
  });

  describe('DELETE /group/:id', () => {
    let id: string;

    beforeAll(() => {
      id = new ObjectId().toHexString();
    });
    it('should return status code 200 with a valid ID', async () => {
      const response = await request(server).delete(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
