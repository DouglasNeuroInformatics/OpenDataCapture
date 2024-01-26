import { Router } from 'express';

import { db } from '@/lib/db';

const router = Router();

router.get('/assignments/:id', (req, res, next) => {
  const id = req.params.id;
  const assignment = db.data.assignments.find((assignment) => assignment.id === id);
  if (!assignment) {
    return next();
  }
  const html = res.locals.loadRoot({ bundle: assignment.instrumentBundle });
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

export { router as rootRouter };
