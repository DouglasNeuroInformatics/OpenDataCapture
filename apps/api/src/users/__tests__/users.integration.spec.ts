import { ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { CreateUserData } from '@open-data-capture/common/user';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { GroupsService } from '@/groups/groups.service';
import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';
import { type MockedInstance, createMock } from '@/testing/testing.utils';
import { createMockModelProvider } from '@/testing/testing.utils';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('/users', () => {
  let app: NestExpressApplication;
  let server: any;

  let groupsService: MockedInstance<GroupsService>;

  let userModel: MockedInstance<Model<'User'>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: CryptoService,
          useValue: createMock(CryptoService)
        },
        {
          provide: GroupsService,
          useValue: createMock(GroupsService)
        },
        createMockModelProvider('User')
      ]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalPipes(new ValidationPipe());

    groupsService = app.get(GroupsService);
    userModel = app.get(getModelToken('User'));

    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /users', () => {
    const mockCreateUserData: CreateUserData = Object.freeze({
      basePermissionLevel: null,
      firstName: 'Jane',
      groupIds: [],
      lastName: 'Doe',
      password: 'Password12345678',
      username: 'user'
    });

    it('should return status code 400 with a request with an empty body', async () => {
      const response = await request(server).post('/users').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 400 with a request with a non-string value for username', async () => {
      const response = await request(server).post('/users').send({
        password: 'Password123',
        username: null
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 400 when username is an empty string', async () => {
      const response = await request(server).post('/users').send({ username: '' });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 400 with a request with a weak password', async () => {
      const response = await request(server).post('/users').send({
        password: 'password',
        username: 'user'
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where the user already exists', async () => {
      userModel.exists.mockResolvedValueOnce(true);
      const response = await request(server)
        .post('/users')
        .send({ ...mockCreateUserData });
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return status code 404 if one of the groups does not exist', async () => {
      groupsService.findById.mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      const response = await request(server)
        .post('/users')
        .send({ ...mockCreateUserData, groupIds: ['123'] });
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return status code 201 for a properly formulated request', async () => {
      const response = await request(server)
        .post('/users')
        .send({ ...mockCreateUserData });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('GET /users', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/users');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return an array of all users if no group is provided', async () => {
      userModel.findMany.mockResolvedValueOnce([{ username: 'foo' }]);
      const response = await request(server).get('/users');
      expect(response.body).toMatchObject([{ username: 'foo' }]);
    });
  });

  describe('GET /users/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new ObjectId().toHexString();
    });
    it('should return status code 200 with a valid ID', async () => {
      userModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).get(`/users/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the user does not exist', async () => {
      userModel.findFirst.mockResolvedValueOnce(null);
      const response = await request(server).get(`/users/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the user if it exists', async () => {
      userModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).get(`/users/${id}`);
      expect(response.body).toMatchObject({ id });
    });
  });

  describe('PATCH /users/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new ObjectId().toHexString();
    });
    it('should reject a request to set the username to an empty string', async () => {
      userModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/users/${id}`).send({ username: '' });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request to set the username to a number', async () => {
      userModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/users/${id}`).send({ username: 100 });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should return status code 200 with a valid ID, even if nothing is modified', async () => {
      userModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/users/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return status code 200 with a valid ID and valid data', async () => {
      userModel.findFirst.mockResolvedValueOnce({ id });
      const response = await request(server).patch(`/users/${id}`).send({ username: 'foo' });
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  describe('DELETE /user/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new ObjectId().toHexString();
    });
    it('should return status code 200 with a valid ID', async () => {
      const response = await request(server).delete(`/users/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
