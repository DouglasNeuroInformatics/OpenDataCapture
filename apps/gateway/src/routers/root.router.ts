import { Router } from 'express';

import { prisma } from '@/lib/prisma';
import { ah } from '@/utils/async-handler';
import { generateToken } from '@/utils/auth';

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
    } else if (assignment.completedAt) {
      return res
        .status(409)
        .set({ 'Content-Type': 'application/json' })
        .json({ error: 'Conflict', message: 'Assignment already completed', statusCode: 409 });
    }
    const token = generateToken(assignment.id);
    const html = res.locals.loadRoot({ bundle: assignment.instrumentBundle, id, token });
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  })
);

export { router as rootRouter };
