import type { RequestHandler } from 'express';

import HttpError from '../models/HttpError';

const dummyPatients = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date(),
    sex: 'Male'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: new Date(),
    sex: 'Female'
  }
];

export const getAllPatients: RequestHandler = (req, res) => {
  console.log('GET request');
  res.json(dummyPatients);
};

export const getPatientById: RequestHandler = (req, res, next) => {
  console.log('GET request');
  const patientId = req.params.id;
  console.log(patientId);
  const patient = dummyPatients.find(element => element.id === parseInt(patientId));
  if (!patient) {
    return next(new HttpError(404, `Could not find patient with id ${patientId}`));
  }
  return res.status(200).json(patient);
};

export const addNewPatient: RequestHandler = ((req, res) => {
  const data = req.body;
  const patient = {
    id: Math.random(),
    firstName: data.firstName,
    lastName: data.lastName,
    sex: data.sex,
    dateOfBirth: data.dateOfBirth,
    dateAdded: new Date(),
    dateUpdated: new Date()
  };
  dummyPatients.push(patient);
  return res.status(201).json({
    patient: patient
  });
});