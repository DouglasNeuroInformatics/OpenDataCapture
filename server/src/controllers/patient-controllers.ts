import type { MongoServerError } from 'mongodb';

import HappinessQuestionnaire from '../models/HappinessQuestionnaire';
import { AsyncController, Controller } from '../interfaces';
import Patient, { PatientType } from '../models/Patient';
import createPatientId from '../utils/createPatientId';
import { HttpError } from '../utils/exceptions';

export const getAllPatients: AsyncController = async (req, res) => {
  res.json(await Patient.find());
};

export const getPatientById: Controller = (req, res) => {
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

export const deletePatientById: AsyncController = async (req, res) => {
  try {
    await Patient.deleteOne({ _id: req.params.id });
    await HappinessQuestionnaire.deleteMany({ patientId: req.params.id }).exec()
    console.log(`Deleted patient with id: ${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export const addNewPatient: AsyncController = async (req, res, next) => {
  const { firstName, lastName, dateOfBirth, sex } = req.body as PatientType; // VALIDATE
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
    res.status(201).end();
  } catch (error) {
    console.log(error)
    const isDuplicateId = (error as MongoServerError).code === 11000;
    if (isDuplicateId) {
      next(new HttpError(409, 'Patient with id already exists'));
    }
    next(new HttpError(500, 'Failed to save patient'));
  }
};
