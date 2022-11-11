import { AsyncController } from '../interfaces';
import Patient, { PatientType } from '../models/Patient';

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

export const deletePatientById: AsyncController = async (req, res) => {
  try {
    await Patient.deleteOne({ _id: req.params.id });
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};
