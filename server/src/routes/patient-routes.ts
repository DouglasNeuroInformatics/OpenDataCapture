import { Router } from 'express';

import { getAllPatients, deletePatientById } from '../controllers/patient-controllers';

const router = Router();

router.get('/', getAllPatients);

router.delete('/:id', deletePatientById);

export default router;
