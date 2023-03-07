import request from 'supertest';

import { HttpStatus } from '@nestjs/common';
import { UserStubs } from '@/users/test/users.stubs';

import { db, server } from './config/jest-e2e.setup';

describe('GET /users', () => {
  it('should return the default admin user as an array', async () => {
    const response = await request(server).get('/users');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject([UserStubs.mockSystemAdmin]);
  });
});

describe('POST /users', () => {
  it('should reject a request with an empty body', () => {
    return request(server).post('/users').send().expect(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user with an invalid role', () => {
    return request(server)
      .post('/users')
      .send({
        username: 'user',
        password: 'Password123',
        role: 'sudo'
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user with a weak password', () => {
    return request(server)
      .post('/users')
      .send({
        username: 'user',
        password: 'password',
        role: 'standard-user'
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user that already exists', () => {
    const mockSystemAdminDto = Object.assign(UserStubs.mockSystemAdmin, {
      password: UserStubs.mockPlainTextPassword
    });
    return request(server).post('/users').send(mockSystemAdminDto).expect(HttpStatus.CONFLICT);
  });

  it('should create a new user when the correct data is provided', () => {
    return request(server)
      .post('/users')
      .send({
        username: 'user',
        password: 'Password123',
        role: 'standard-user'
      })
      .expect(HttpStatus.CREATED);
  });
});

describe('GET /users/:username', () => {
  it('should throw if the user does not exist', async () => {
    const response = await request(server).get('/users/foo');
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return the user object if they exist', async () => {
    const response = await request(server).get(`/users/${UserStubs.mockSystemAdmin.username}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(UserStubs.mockSystemAdmin);
  });
});

describe('PATCH /users/:username', () => {
  beforeAll(async () => {
    await db.collection('users').insertOne(UserStubs.mockStandardUser);
  });

  it('should throw if the user does not exist', async () => {
    const response = await request(server).patch('/users/foo').send({ username: 'bar' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should throw if the request body is empty', async () => {
    const response = await request(server).patch(`/users/${UserStubs.mockStandardUser.username}`).send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should modify the patched properties of the user in the database', async () => {
    const modifiedUser = { ...UserStubs.mockStandardUser, role: 'group-manager' };
    const response = await request(server).patch(`/users/${UserStubs.mockStandardUser.username}`).send({
      role: 'group-manager'
    });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(modifiedUser);
  });

  afterAll(async () => {
    await db.collection('users').deleteOne({ username: UserStubs.mockStandardUser.username });
  });
});

describe('DELETE /users/:username', () => {
  it('should throw if the user does not exist', async () => {
    const response = await request(server).delete('/users/foo');
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return the user if successfully deleted', async () => {
    await db.collection('users').insertOne(UserStubs.mockStandardUser);
    const response = await request(server).delete(`/users/${UserStubs.mockStandardUser.username}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(UserStubs.mockStandardUser);
    await db.collection('users').deleteOne({ username: UserStubs.mockStandardUser.username });
  });
});
