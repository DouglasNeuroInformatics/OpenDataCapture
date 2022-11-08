import { Router } from 'express';

import { getAllPatients, getPatientById, addNewPatient } from '../controllers/patient-controllers';

const router = Router();

router.get('/', getAllPatients);

router.get('/:id', getPatientById);

router.post('/', addNewPatient);

export default router;
