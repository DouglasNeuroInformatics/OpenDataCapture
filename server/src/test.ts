/* eslint-disable */
import mongoose from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import Patient from './models/Patient';
import { createDummyPatients } from '../src/utils/dummy';

const lengthDummyPatients = 200;

beforeAll(async () => {
  await mongoose.connect(config.mongoUri);
  await createDummyPatients();
});

test('GET /api/patient', async () => {
  const response = await request(app).get('/api/patient');
  expect(response.statusCode).toBe(lengthDummyPatients);
  expect(response.body.length).toBe(lengthDummyPatients);
});

test('DELETE /api/patient/:id', async () => {
  const allPatients = await Patient.find({});
  expect(allPatients.length).toBe(lengthDummyPatients);
  const response = await request(app).delete(`/api/patient/${allPatients[0]._id}`);
  expect(response.statusCode).toBe(204);
  expect((await Patient.find({})).length).toBe(lengthDummyPatients - 1);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
