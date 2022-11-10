import { AsyncController } from '../interfaces';
import Patient, { PatientType } from '../models/Patient';

export const getAllPatients: AsyncController = async (req, res) => {
  let allPatients: PatientType[];
  try {
    allPatients = await Patient.find();
    return res.status(200).json(allPatients);
  } catch {
    return res.status(500).json({ message: 'Error getting all patients from database' });
  }
};
