import mongoose from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import config from '../src/config';

beforeAll(async () => {
  await mongoose.connect(config.mongoUri);
});

test('GET /api/patient', async () => {
  const response = await request(app).get('/api/patient');
  expect(response.statusCode).toBe(200);
});

afterAll(async () => {
  await mongoose.connection.close();
});
