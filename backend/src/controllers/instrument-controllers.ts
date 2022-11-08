import type { RequestHandler } from 'express';

import createPatientId from '../utils/createPatientId';

export const getHappinessQuestionnairesForPatient: RequestHandler = async (req, res) => {
  const { firstName, lastName, dateOfBirth } = req.body;
  const patientId = createPatientId(firstName, lastName, dateOfBirth)
  console.log(patientId)
  return res.status(200).json({
    msg: 'happy'
  })
}

export const addHappinessQuestionnaire: RequestHandler = async (req, res) => {
  return res.status(200).end()
}