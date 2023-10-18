import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';

import { AbilityService } from '@/ability/ability.service';

import { GroupsController } from '../groups.controller';
import { GroupsRepository } from '../groups.repository';
import { GroupsService } from '../groups.service';

describe('/groups', () => {
  let app: NestExpressApplication;
  let server: unknown;

  let abilityService: MockedInstance<AbilityService>;
  let groupsRepository: MockedInstance<GroupsRepository>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        GroupsService,
        {
          provide: AbilityService,
          useValue: createMock(AbilityService)
        },
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

    abilityService = app.get(AbilityService);
    groupsRepository = app.get(GroupsRepository);

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
      groupsRepository.exists.mockResolvedValueOnce(true);
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
      groupsRepository.find.mockResolvedValueOnce([{ name: 'foo' }]);
      const response = await request(server).get('/groups');
      expect(response.body).toMatchObject([{ name: 'foo' }]);
    });
  });

  describe('GET /groups/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });

    it('should reject a request with an invalid id', async () => {
      const response = await request(server).get('/groups/123');
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID', async () => {
      abilityService.can.mockReturnValueOnce(true);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      const response = await request(server).get(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the group does not exist', async () => {
      groupsRepository.findById.mockResolvedValueOnce(null);
      const response = await request(server).get(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should reject a request if the user has insufficient permissions', async () => {
      abilityService.can.mockReturnValueOnce(false);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      const response = await request(server).get(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
    it('should return the group if it exists', async () => {
      abilityService.can.mockReturnValueOnce(true);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      const response = await request(server).get(`/groups/${id}`);
      expect(response.body).toMatchObject({ id });
    });
  });

  describe('PATCH /groups/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });

    it('should reject a request with an invalid id', async () => {
      const response = await request(server).patch('/groups/123');
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request to set the group name to an empty string', async () => {
      abilityService.can.mockReturnValueOnce(true);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/groups/${id}`).send({ name: '' });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request to set the group name to a number', async () => {
      abilityService.can.mockReturnValueOnce(true);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/groups/${id}`).send({ name: 100 });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID, even if nothing is modified', async () => {
      abilityService.can.mockReturnValueOnce(true);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return status code 200 with a valid ID and valid data', async () => {
      abilityService.can.mockReturnValueOnce(true);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/groups/${id}`).send({ name: 'foo' });
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return the modified group', async () => {
      abilityService.can.mockReturnValueOnce(true);
      groupsRepository.findById.mockResolvedValueOnce({ id });
      groupsRepository.updateById.mockImplementationOnce((id: string, obj: object) => ({ id, ...obj }));
      const response = await request(server).patch(`/groups/${id}`).send({ name: 'foo' });
      expect(response.body).toMatchObject({ name: 'foo' });
    });
  });

  describe('DELETE /group/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });

    it('should reject a request with an invalid id', async () => {
      const response = await request(server).delete('/groups/123');
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID', async () => {
      abilityService.can.mockReturnValueOnce(true);
      const response = await request(server).delete(`/groups/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
