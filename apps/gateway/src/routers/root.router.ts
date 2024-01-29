import { Router } from 'express';

import { prisma } from '@/lib/prisma';
import { ah } from '@/utils/async-handler';

const router = Router();

router.get(
  '/assignments/:id',
  ah(async (req, res, next) => {
    const id = req.params.id;
    const assignment = await prisma.remoteAssignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      return next();
    }
    const html = res.locals.loadRoot({ bundle: assignment.instrumentBundle, id });
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  })
);

export { router as rootRouter };
