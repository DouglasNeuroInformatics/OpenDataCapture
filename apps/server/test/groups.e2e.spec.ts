import request from 'supertest';

import { HttpStatus } from '@nestjs/common';

import { server } from './config/jest-e2e.setup';
import { GroupStubs } from '@/groups/test/group.stubs';

it('should do nothing', () => {
  expect(true).toBeTruthy();
});

/*
describe('POST /groups', () => {
  it('should reject a request with an empty body', async () => {
    const response = await request(server)
      .post('/groups')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send();
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should reject a request to create a group with an empty name', async () => {
    const response = await request(server)
      .post('/groups')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send({
        name: ''
      });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should create a new group when given the correct data', async () => {
    const response = await request(server)
      .post('/groups')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' })
      .send(GroupStubs.myClinic);
    expect(response.status).toBe(HttpStatus.CREATED);
  });
});

describe('GET /groups', () => {
  it('should return an empty array', async () => {
    const response = await request(server)
      .get('/groups')
      .auth(UserStubs.mockSystemAdmin.accessToken, { type: 'bearer' });
    console.log(response.body);
    expect(response.status).toBe(HttpStatus.OK);
  });
});
*/
