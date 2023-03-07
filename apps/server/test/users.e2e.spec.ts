import request from 'supertest';

import { HttpStatus } from '@nestjs/common';
import { UserStubs } from '@/users/test/users.stubs';

import { db, server } from './config/jest-e2e.setup';

const mockUsers = [UserStubs.mockSystemAdmin, UserStubs.mockGroupManager, UserStubs.mockStandardUser];

describe('GET /users', () => {
  it('should return the mock users as an array', async () => {
    const response = await request(server).get('/users');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(mockUsers);
  });
});

describe('POST /users', () => {
  it('should reject a request with an empty body', async () => {
    const response = await request(server).post('/users').send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user with an invalid role', async () => {
    const response = await request(server).post('/users').send({
      username: 'user',
      password: 'Password123',
      role: 'sudo'
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user with a weak password', async () => {
    const response = await request(server).post('/users').send({
      username: 'user',
      password: 'password',
      role: 'standard-user'
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user that already exists', async () => {
    const mockSystemAdminDto = Object.assign(UserStubs.mockSystemAdmin, {
      password: UserStubs.mockPlainTextPassword
    });
    const response = await request(server).post('/users').send(mockSystemAdminDto);
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('should create a new user when the correct data is provided', async () => {
    const response = await request(server).post('/users').send({
      username: 'user',
      password: 'Password123',
      role: 'standard-user'
    });
    expect(response.status).toBe(HttpStatus.CREATED);
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
  it('should throw if the user does not exist', async () => {
    const response = await request(server).patch('/users/foo').send({ username: 'bar' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should throw if the request body is empty', async () => {
    const response = await request(server).patch(`/users/${UserStubs.mockStandardUser.username}`).send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should modify the patched properties of the user in the database', async () => {
    db.collection('users').insertOne(UserStubs.mockStandardUser);
    const modifiedUser = { ...UserStubs.mockStandardUser, role: 'group-manager' };
    const response = await request(server).patch(`/users/${UserStubs.mockStandardUser.username}`).send({
      role: 'group-manager'
    });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(modifiedUser);
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
