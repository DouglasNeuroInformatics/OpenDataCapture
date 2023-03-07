import request from 'supertest';

import { HttpStatus } from '@nestjs/common';

import { db, server } from './config/jest-e2e.setup';
import { UserStubs } from '@/users/test/users.stubs';

describe('POST /auth/login', () => {
  it('should reject a request with an empty body', async () => {
    const response = await request(server).post('/auth/login').send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request with a valid username but no password', async () => {
    const response = await request(server).post('/auth/login').send({
      username: UserStubs.mockSystemAdmin.username
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request with a password but no username', async () => {
    const response = await request(server).post('/auth/login').send({
      password: UserStubs.mockSystemAdmin.password
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request with valid credentials but an additional property', async () => {
    const response = await request(server).post('/auth/login').send({
      username: UserStubs.mockSystemAdmin.username,
      password: UserStubs.mockPlainTextPassword,
      foo: 'bar'
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should allow a request that contains a password of length one', async () => {});
});
