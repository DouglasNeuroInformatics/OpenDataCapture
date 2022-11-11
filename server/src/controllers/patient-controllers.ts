import { MongoServerError } from 'mongodb';

import { AsyncController } from '../interfaces';
import Patient, { PatientType } from '../models/Patient';
import createPatientId from '../utils/createPatientId';

export const getAllPatients: AsyncController = async (req, res) => {
  let allPatients: PatientType[];
  try {
    allPatients = await Patient.find();
    return res.status(200).json(allPatients);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export const addNewPatient: AsyncController = async (req, res) => {
  const { firstName, lastName, dateOfBirth, sex } = req.body as PatientType; // VALIDATE
  const patientId = createPatientId(firstName, lastName, new Date(dateOfBirth));
  const patient = new Patient({
    _id: patientId,
    firstName: firstName,
    lastName: lastName,
    dateOfBirth: new Date(dateOfBirth),
    sex: sex,
  });
  try {
    await patient.save();
    return res.status(201).end();
  } catch (error) {
    console.log(error)
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(400).end(); // Duplicate ID
    }
    return res.status(500).end();
  }
};

export const deletePatientById: AsyncController = async (req, res) => {
  try {
    await Patient.deleteOne({ _id: req.params.id });
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};