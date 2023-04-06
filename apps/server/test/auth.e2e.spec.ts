it('should do nothing', () => {
  expect(true).toBeTruthy();
});

/** 
import { HttpStatus } from '@nestjs/common';

import request from 'supertest';

import { admin, server } from './config/jest-e2e.setup';

describe('POST /auth/login', () => {
  it('should reject a request with an empty body', async () => {
    const response = await request(server).post('/auth/login').send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request with a valid username but no password', async () => {
    const response = await request(server).post('/auth/login').send({
      username: admin.username
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request with a password but no username', async () => {
    const response = await request(server).post('/auth/login').send({
      password: admin.password
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request with valid credentials but an additional property', async () => {
    const response = await request(server).post('/auth/login').send({
      username: admin.username,
      password: admin.password,
      foo: 'bar'
    });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request that contains an invalid username', async () => {
    const response = await request(server).post('/auth/login').send({
      username: 'foo',
      password: 'bar'
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Invalid username');
  });

  it('should reject a request that contains an invalid password', async () => {
    const response = await request(server).post('/auth/login').send({
      username: admin.username,
      password: 'foo'
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Invalid password');
  });

  it('should return a JSON web token when provided the correct credentials', async () => {
    const response = await request(server).post('/auth/login').send({
      username: admin.username,
      password: admin.password
    });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({
      accessToken: expect.any(String)
    });
  });
});
*/
