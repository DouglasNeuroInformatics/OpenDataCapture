import request from 'supertest';

import { HttpStatus } from '@nestjs/common';
import { UserStubs } from '@/users/test/users.stubs';

import { server } from './config/jest-e2e.setup';

describe('GET /users', () => {
  it('should reject a request from a user with no credentials', async () => {
    const response = await request(server).get('/users');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  /*

  it('should reject a request from a standard user', async () => {
    const response = await request(server)
      .get('/users')
      .auth(UserStubs.mockStandardUser.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });

  it('should reject a request from a group manager', async () => {
    const response = await request(server)
      .get('/users')
      .auth(UserStubs.mockGroupManager.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
  */

  it('should return the mock users as an array for a sysadmin', async () => {
    const response = await request(server)
      .get('/users')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(UserStubs.mockUsersWithoutTokens);
  });
});

describe('POST /users', () => {
  it('should reject a request with an empty body', async () => {
    const response = await request(server)
      .post('/users')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user with an invalid role', async () => {
    const response = await request(server)
      .post('/users')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send({
        username: 'user',
        password: 'Password123',
        role: 'sudo'
      });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user with a weak password', async () => {
    const response = await request(server)
      .post('/users')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send({
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
    const response = await request(server)
      .post('/users')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send(mockSystemAdminDto);
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('should create a new user when the correct data is provided', async () => {
    const response = await request(server)
      .post('/users')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send({
        username: 'user',
        password: 'Password123',
        role: 'standard-user'
      });
    expect(response.status).toBe(HttpStatus.CREATED);
  });
});

describe('GET /users/:username', () => {
  it('should throw if the user does not exist', async () => {
    const response = await request(server)
      .get('/users/foo')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return the user object if they exist', async () => {
    const { accessToken, ...expectedData } = UserStubs.mockSystemAdmin;
    const response = await request(server)
      .get(`/users/${UserStubs.mockSystemAdmin.username}`)
      .auth(accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(expectedData);
  });
});

describe('PATCH /users/:username', () => {
  it('should throw if the user does not exist', async () => {
    const response = await request(server)
      .patch('/users/foo')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send({ username: 'bar' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should throw if the request body is empty', async () => {
    const response = await request(server)
      .patch(`/users/${UserStubs.mockStandardUser.username}`)
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should modify the patched properties of the user in the database', async () => {
    const { accessToken, ...expectedData } = UserStubs.mockSystemAdmin;
    const modifiedUser = { ...expectedData, role: 'group-manager' };
    const response = await request(server)
      .patch(`/users/${UserStubs.mockSystemAdmin.username}`)
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send({
        role: 'group-manager'
      });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(modifiedUser);
  });
});

describe('DELETE /users/:username', () => {
  it('should throw if the user does not exist', async () => {
    const response = await request(server)
      .delete('/users/foo')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return the user if successfully deleted', async () => {
    const { accessToken, ...expectedData } = UserStubs.mockSystemAdmin;
    const response = await request(server)
      .delete(`/users/${UserStubs.mockSystemAdmin.username}`)
      .auth(accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject(expectedData);
  });

  it('should not allow the admin to delete himself twice', async () => {
    const { accessToken, username } = UserStubs.mockSystemAdmin;
    await request(server).delete(`/users/${username}`).auth(accessToken, { type: 'bearer' });
    const response = await request(server).delete(`/users/${username}`).auth(accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
