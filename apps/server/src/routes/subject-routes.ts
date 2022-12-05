import { Router } from 'express';

import { addNewSubject, getAllSubjects, deleteSubjectById } from '../controllers/subject-controllers';

const router = Router();

router.get('/', getAllSubjects);

router.post('/', addNewSubject);

router.delete('/:id', deleteSubjectById);

export default router;
