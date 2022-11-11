import { Router } from 'express';

import { addNewPatient, getAllPatients, deletePatientById } from '../controllers/patient-controllers';

const router = Router();

router.get('/', getAllPatients);

router.post('/', addNewPatient);

router.delete('/:id', deletePatientById);

export default router;
