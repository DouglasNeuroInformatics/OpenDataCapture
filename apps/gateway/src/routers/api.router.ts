import crypto from 'crypto';

import { $CreateAssignmentRelayData, $UpdateAssignmentData } from '@open-data-capture/common/assignment';
import { Router } from 'express';

import { CONFIG } from '@/config';
import { prisma } from '@/lib/prisma';
import { ah } from '@/utils/async-handler';
import { HttpException } from '@/utils/http-exception';

const router = Router();

router.get(
  '/assignments',
  ah(async (_, res) => {
    const assignments = await prisma.assignmentModel.findMany();
    return res.status(200).json(assignments);
  })
);

router.post(
  '/assignments',
  ah(async (req, res) => {
    const result = await $CreateAssignmentRelayData.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    const createdAt = new Date();
    const id = crypto.randomUUID();
    const assignment = await prisma.assignmentModel.create({
      data: {
        createdAt,
        id,
        status: 'OUTSTANDING',
        url: `${CONFIG.baseUrl}/assignments/${id}`,
        ...result.data
      }
    });
    res.status(200).send(assignment);
  })
);

router.patch(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.assignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    const result = await $UpdateAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    await prisma.assignmentModel.update({
      data: result.data,
      where: {
        id: assignment.id
      }
    });
    res.status(200).json({ success: true });
  })
);

router.delete(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.assignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    await prisma.assignmentModel.delete({
      where: { id }
    });
    res.status(200).json({ success: true });
  })
);

export { router as apiRouter };
