import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AbilityService } from '@/ability/ability.service';

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

  afterAll(async () => {
    await app.close();
  });
});
