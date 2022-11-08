import type { RequestHandler } from 'express';

import Patient from '../models/Patient';
import createPatientId from '../utils/createPatientId';
import { HttpError } from '../utils/exceptions';

export const getAllPatients: RequestHandler = async (req, res) => {
  return res.json(await Patient.find());
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

export const deletePatientById: RequestHandler = async (req, res, next) => {
  try {
    await Patient.deleteOne({ _id: req.params.id });
    console.log(`Deleted patient with id: ${req.params.id}`)
    return res.status(204);
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
}

export const addNewPatient: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, dateOfBirth, sex } = req.body;
  const patientId = createPatientId(firstName, lastName, new Date(dateOfBirth));
  const patient = new Patient({
    _id: patientId,
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
