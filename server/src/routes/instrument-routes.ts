import { Router } from 'express';

import {
  addHappinessQuestionnaire,
  getHappinessQuestionnairesForPatient,
} from '../controllers/instrument-controllers';

const router = Router();

router.get('/happiness-scale/:id', getHappinessQuestionnairesForPatient);

router.post('/happiness-scale', addHappinessQuestionnaire);

export default router;
