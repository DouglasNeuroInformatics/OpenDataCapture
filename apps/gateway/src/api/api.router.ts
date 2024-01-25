import crypto from 'crypto';

import { $CreateAssignmentRelayData, $UpdateAssignmentData } from '@open-data-capture/common/assignment';
import { Router } from 'express';

import { CONFIG } from '@/config';
import { db } from '@/lib/db';
import { ah } from '@/utils/async-handler';
import { HttpException } from '@/utils/http-exception';

const router = Router();

router.get('/assignments', (_, res) => {
  return res.status(200).json(db.data.assignments);
});

router.post(
  '/assignments',
  ah(async (req, res) => {
    const result = await $CreateAssignmentRelayData.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    await db.update(({ assignments }) => {
      const createdAt = new Date();
      const id = crypto.randomUUID();
      assignments.push({
        createdAt,
        id,
        status: 'OUTSTANDING',
        updatedAt: createdAt,
        url: `${CONFIG.baseUrl}/assignments/${id}`,
        ...result.data
      });
    });
    res.status(200).send(result.data);
  })
);

router.patch(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const index = db.data.assignments.findIndex((assignment) => assignment.id === id);
    if (index === -1) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    const result = await $UpdateAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    await db.update(({ assignments }) => {
      assignments[index] = { ...assignments[index], ...result.data };
    });
    res.status(200).json({ success: true });
  })
);

router.delete(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const index = db.data.assignments.findIndex((assignment) => assignment.id === id);
    if (index === -1) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    await db.update(({ assignments }) => {
      assignments.splice(index, 1);
    });
    res.status(200).json({ success: true });
  })
);

export { router as apiRouter };
