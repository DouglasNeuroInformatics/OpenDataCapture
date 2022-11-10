import { Router } from 'express';

import { getAllPatients } from '../controllers/patient-controllers';

const router = Router();

router.get('/', getAllPatients);

export default router;
