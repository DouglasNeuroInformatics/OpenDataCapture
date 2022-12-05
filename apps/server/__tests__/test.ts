import mongoose from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import Subject from '../src/models/Subject';
import { createDummySubjects } from '../src/utils/dummy';

const lengthDummySubjects = 200;

beforeAll(async () => {
  await mongoose.connect(config.mongoUri);
  await createDummySubjects();
});

test('GET /api/subject', async () => {
  const response = await request(app).get('/api/subject');
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(lengthDummySubjects);
});

test('POST /api/subject', async () => {
  const subject = new Subject({
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: new Date(1950, 0),
    sex: 'female'
  });
  const response = await request(app).post('/api/subject').send(subject.toJSON());
  expect(response.statusCode).toBe(201);
  expect((await Subject.find({})).length).toBe(lengthDummySubjects + 1);
});

test('DELETE /api/subject/:id', async () => {
  const allSubjects = await Subject.find({});
  const response = await request(app).delete(`/api/subject/${allSubjects[0]._id}`);
  expect(response.statusCode).toBe(204);
  expect((await Subject.find({})).length).toBe(lengthDummySubjects);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
