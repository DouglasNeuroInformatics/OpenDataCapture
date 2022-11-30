import mongoose from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import Patient from '../src/models/Patient';
import { createDummyPatients } from '../src/utils/dummy';

const lengthDummyPatients = 200;

beforeAll(async () => {
  await mongoose.connect(config.mongoUri);
  await createDummyPatients();
});

test('GET /api/patient', async () => {
  const response = await request(app).get('/api/patient');
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(lengthDummyPatients);
});

test('POST /api/patient', async () => {
  const patient = new Patient({
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: new Date(1950, 0),
    sex: 'female'
  });
  const response = await request(app).post('/api/patient').send(patient.toJSON());
  expect(response.statusCode).toBe(201);
  expect((await Patient.find({})).length).toBe(lengthDummyPatients + 1);
});

test('DELETE /api/patient/:id', async () => {
  const allPatients = await Patient.find({});
  const response = await request(app).delete(`/api/patient/${allPatients[0]._id}`);
  expect(response.statusCode).toBe(204);
  expect((await Patient.find({})).length).toBe(lengthDummyPatients);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
