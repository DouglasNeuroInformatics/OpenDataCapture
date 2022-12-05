import { Router } from 'express';

import { addHappinessQuestionnaire, getHappinessQuestionnairesForSubject } from '../controllers/instrument-controllers';

const router = Router();

router.get('/happiness-scale/:id', getHappinessQuestionnairesForSubject);

router.post('/happiness-scale', addHappinessQuestionnaire);

export default router;
