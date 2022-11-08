import type { RequestHandler } from 'express';

import HappinessQuestionnaire from '../models/HappinessQuestionnaire';
import Patient from '../models/Patient';
import createPatientId from '../utils/createPatientId';
import { HttpError } from '../utils/exceptions';

export const getHappinessQuestionnairesForPatient: RequestHandler = async (req, res, next) => {
  
  if (!req.params.id) {
    return next(new HttpError(404, ''))
  }
  console.log(req.params.id)
  //const results = await HappinessQuestionnaire.find({ _id: req.params.id }).exec();
  //console.log(results)
  return res.status(200).json({
    score: -1
  })
}

export const addHappinessQuestionnaire: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, dateOfBirth, score } = req.body;
  const patientId = createPatientId(firstName, lastName, new Date(dateOfBirth));
  console.log(patientId)
  const isPatient = await Patient.findById(patientId) !== null;
  if (!isPatient) {
    return res.status(400).json({
      message: 'Patient does not exist'
    })
  }
  const questionnaire = new HappinessQuestionnaire({
    patientId: patientId,
    score: score
  });
  try {
    await questionnaire.save()
    return res.status(201).end()
  } catch (error) {
    return next(new HttpError(500, 'Failed to save patient'))
  }
}