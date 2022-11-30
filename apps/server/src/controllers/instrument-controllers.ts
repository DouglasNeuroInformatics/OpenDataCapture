import { Validation } from 'utils';

import { AsyncController, HappinessQuestionnaireResponse } from '../interfaces';
import HappinessQuestionnaire from '../models/instruments/HappinessQuestionnaire';
import Patient from '../models/Patient';
import createPatientId from '../utils/createPatientId';

export const getHappinessQuestionnairesForPatient: AsyncController = async (req, res) => {
  if (!req.params.id) {
    res.statusMessage = 'Must specify patient ID';
    return res.status(400).end();
  }
  const results = await HappinessQuestionnaire.find({ patientId: req.params.id }).exec();
  return res.status(200).json(results);
};

export const addHappinessQuestionnaire: AsyncController = async (req, res) => {
  const data = req.body as unknown;
  if (typeof data !== 'object' || data === null) {
    res.statusMessage = 'Invalid format of request body, must be object';
    return res.status(400).end();
  }

  const fields = ['firstName', 'lastName', 'dateOfBirth', 'score'];
  const props: Partial<HappinessQuestionnaireResponse> = {};
  for (const field of fields) {
    if (Validation.isObjKey(field, data)) {
      props[field] = data[field];
    } else {
      res.statusMessage = `Invalid format of request body, must contain key '${field}'`;
      return res.status(400).end();
    }
  }

  const { firstName, lastName, dateOfBirth, score } = props as HappinessQuestionnaireResponse;
  const patientId = createPatientId(firstName, lastName, new Date(dateOfBirth));
  const isPatient = (await Patient.findById(patientId)) !== null;
  if (!isPatient) {
    res.statusMessage = 'Patient does not exist';
    return res.status(400).end();
  }
  const questionnaire = new HappinessQuestionnaire({
    patientId: patientId,
    score: score
  });

  try {
    await questionnaire.save();
    return res.status(201).end();
  } catch (error) {
    res.statusMessage = 'Failed to save response';
    return res.status(500).end();
  }
};
