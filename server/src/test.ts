/* eslint-disable */
import mongoose from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import { createDummyPatients } from '../src/utils/dummy'

beforeAll(async () => {
  await mongoose.connect(config.mongoUri);
  await createDummyPatients();
});

test('GET /api/patient', async () => {
  const response = await request(app).get('/api/patient');
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(200);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
