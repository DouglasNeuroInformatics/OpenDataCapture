import { Router } from 'express';

import { getAllPatients, getPatientById, postNewPatient } from '../controllers/patient-controllers';

const router = Router();

router.get('/', getAllPatients);

router.get('/:id', getPatientById);

router.post('/', postNewPatient);

export default router;