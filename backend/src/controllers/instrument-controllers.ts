import { AsyncController } from '../interfaces';
import HappinessQuestionnaire from '../models/HappinessQuestionnaire';
import Patient from '../models/Patient';
import createPatientId from '../utils/createPatientId';
import { HttpError } from '../utils/exceptions';

// tbd properly
interface HappinessQuestionnaireResponse {
  firstName: string
  lastName: string
  dateOfBirth: string
  score: string
}

export const getHappinessQuestionnairesForPatient: AsyncController = async (req, res, next) => {
  if (!req.params.id) {
    next(new HttpError(404, ''))
  }
  const results = await HappinessQuestionnaire.find({ patientId: req.params.id }).exec();
  console.log("Results", results)
  res.status(200).json(results);
};

export const addHappinessQuestionnaire: AsyncController = async (req, res, next) => {
  const { firstName, lastName, dateOfBirth, score } = req.body as HappinessQuestionnaireResponse;
  const patientId = createPatientId(firstName, lastName, new Date(dateOfBirth));
  console.log(patientId);
  const isPatient = (await Patient.findById(patientId)) !== null;
  if (!isPatient) {
    res.status(400).json({
      message: 'Patient does not exist',
    });
  }
  const questionnaire = new HappinessQuestionnaire({
    patientId: patientId,
    score: score,
  });
  try {
    await questionnaire.save();
    res.status(201).end();
  } catch (error) {
    next(new HttpError(500, 'Failed to save response'));
  }
};
