import type { RequestHandler } from 'express';

import HappinessQuestionnaire from '../models/HappinessQuestionnaire';
import createPatientId from '../utils/createPatientId';

export const getHappinessQuestionnairesForPatient: RequestHandler = async (req, res) => {
  const { patientId } = req.body;
  console.log(patientId)
  return res.status(200).json({
    score: -1
  })
}

export const addHappinessQuestionnaire: RequestHandler = async (req, res) => {
  const { firstName, lastName, dateOfBirth, score } = req.body;
  const patientId = createPatientId(firstName, lastName, new Date(dateOfBirth));
  const questionnaire = new HappinessQuestionnaire({
    patientId: patientId,
    score: score
  });
  console.log(questionnaire);
  return res.status(200).end()
}