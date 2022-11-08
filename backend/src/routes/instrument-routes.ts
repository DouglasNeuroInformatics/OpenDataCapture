import { Router } from 'express';

import { getHappinessQuestionnairesForPatient } from '../controllers/instrument-controllers';

const router = Router();

router.get('/happiness-scale/:id', getHappinessQuestionnairesForPatient);

export default router;