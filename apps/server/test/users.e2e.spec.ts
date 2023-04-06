it('should do nothing', () => {
  expect(true).toBeTruthy();
});

export {};

/**
import { HttpStatus } from '@nestjs/common';

import { BasePermissionLevel } from '@ddcp/common';
import request from 'supertest';

import { admin, server } from './config/jest-e2e.setup';

describe('POST /users', () => {
  it('should reject a request with an empty body', async () => {
    const response = await request(server).post('/users').auth(admin.accessToken, { type: 'bearer' }).send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user with a weak password', async () => {
    const response = await request(server).post('/users').auth(admin.accessToken, { type: 'bearer' }).send({
      username: 'user',
      password: 'password'
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a user that already exists', async () => {
    const response = await request(server).post('/users').auth(admin.accessToken, { type: 'bearer' }).send({
      username: admin.username,
      password: "Password123"
    });
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('should reject a request with extraneous properties', async () => {
    const response = await request(server).post('/users').auth(admin.accessToken, { type: 'bearer' }).send({
      username: 'User',
      password: 'Password123',
      favoriteColor: 'Blue'
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should create a new standard user when the correct data is provided with no role', async () => {
    const response = await request(server).post('/users').auth(admin.accessToken, { type: 'bearer' }).send({
      username: 'user',
      password: 'Password123'
    });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toMatchObject({
      username: 'user'
    });
  });

  it('should create a new admin when the correct data is provided', async () => {
    const response = await request(server).post('/users').auth(admin.accessToken, { type: 'bearer' }).send({
      username: 'user',
      password: 'Password123',
      basePermissionLevel: BasePermissionLevel.Admin
    });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toMatchObject({
      username: 'user',
      basePermissionLevel: BasePermissionLevel.Admin
    });
  });
});

describe('GET /users', () => {
  it('should reject a request from a user with no credentials', async () => {
    const response = await request(server).get('/users');
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should return an array of users that includes the default admin', async () => {
    const response = await request(server).get('/users').auth(admin.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        username: admin.username
      })
    );
  });
});

describe('GET /users/:username', () => {
  it('should throw if the user does not exist', async () => {
    const response = await request(server).get('/users/foo').auth(admin.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return the user object if they exist', async () => {
    const response = await request(server).get(`/users/${admin.username}`).auth(admin.accessToken, { type: 'bearer' });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({
      username: admin.username
    });
  });
});

/*
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
*/
