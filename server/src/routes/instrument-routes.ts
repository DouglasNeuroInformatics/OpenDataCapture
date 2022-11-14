import { Router } from 'express';

import { addHappinessQuestionnaire } from '../controllers/instrument-controllers';

const router = Router();

router.post('/happiness-scale', addHappinessQuestionnaire);

export default router;