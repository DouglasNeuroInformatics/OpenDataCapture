import type { RequestHandler } from 'express';

import createPatientId from '../utils/createPatientId';

export const getHappinessQuestionnairesForPatient: RequestHandler = async (req, res) => {
  const { patientId } = req.body;
  console.log(patientId)
  return res.status(200).json({
    score: -1
  })
}

export const addHappinessQuestionnaire: RequestHandler = async (req, res) => {
  return res.status(200).end()
}