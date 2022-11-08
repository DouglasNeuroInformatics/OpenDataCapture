import { Router } from 'express';

import { deletePatientById, getAllPatients, getPatientById, addNewPatient } from '../controllers/patient-controllers';

const router = Router();

router.get('/', getAllPatients);

router.get('/:id', getPatientById);

router.delete('/:id', deletePatientById);

router.post('/', addNewPatient);

export default router;
