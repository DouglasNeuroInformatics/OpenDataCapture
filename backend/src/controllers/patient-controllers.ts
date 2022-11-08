import type { RequestHandler } from 'express';

import Patient from '../models/Patient';
import { HttpError } from '../utils/exceptions';

export const getAllPatients: RequestHandler = async (req, res) => {
  const allPatients = await Patient.find();
  console.log(allPatients);
  return res.json(allPatients);
};

export const getPatientById: RequestHandler = (req, res, next) => {
  /*
  console.log('GET request');
  const patientId = req.params.id;
  console.log(patientId);
  const patient = dummyPatients.find(element => element.id === parseInt(patientId));
  if (!patient) {
    return next(new HttpError(404, `Could not find patient with id ${patientId}`));
  }
  */
  const patient = {};
  return res.status(200).json(patient);
};

export const addNewPatient: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, dateOfBirth, sex } = req.body;
  // check if any contain
  const patient = new Patient({
    firstName: firstName,
    lastName: lastName,
    dateOfBirth: new Date(dateOfBirth),
    sex: sex,
  });
  console.log(patient);
  try {
    await patient.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError(500, 'Failed to save patient'));
  }
};
