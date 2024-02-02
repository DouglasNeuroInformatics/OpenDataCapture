import { Encrypter } from '@douglasneuroinformatics/crypto';
import { $CreateRemoteAssignmentData, $UpdateAssignmentData } from '@open-data-capture/common/assignment';
import type { AssignmentStatus, MutateAssignmentResponseBody } from '@open-data-capture/common/assignment';
import { Router } from 'express';

import { prisma } from '@/lib/prisma';
import { ah } from '@/utils/async-handler';
import { HttpException } from '@/utils/http-exception';

const router = Router();

router.get(
  '/assignments',
  ah(async (req, res) => {
    let subjectId: string | undefined;
    if (typeof req.query.subjectId === 'string') {
      subjectId = req.query.subjectId;
    }
    const assignments = await prisma.remoteAssignmentModel.findMany({
      where: {
        subjectId
      }
    });
    return res.status(200).json(
      assignments.map(({ encryptedData, ...assignment }) => {
        return {
          ...assignment,
          encryptedData: encryptedData ? Array.from(encryptedData) : null,
          status: assignment.status as AssignmentStatus
        };
      })
    );
  })
);

router.post(
  '/assignments',
  ah(async (req, res) => {
    const result = await $CreateRemoteAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      throw new HttpException(400, 'Bad Request');
    }
    const { publicKey, ...assignment } = result.data;
    await prisma.remoteAssignmentModel.create({
      data: {
        ...assignment,
        completedAt: new Date(),
        rawPublicKey: Buffer.from(publicKey),
      }
    });
    res.status(201).send({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

router.patch(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.remoteAssignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    const result = await $UpdateAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      console.log(result.error);
      throw new HttpException(400, 'Bad Request');
    }
    const { data, expiresAt, status } = result.data;
    const publicKey = await assignment.getPublicKey();
    const encrypter = new Encrypter(publicKey);
    const encryptedData = data ? Buffer.from(await encrypter.encrypt(JSON.stringify(data))) : null;

    await prisma.remoteAssignmentModel.update({
      data: {
        completedAt: result.data.data ? new Date() : undefined,
        encryptedData,
        expiresAt,
        status: data ? ('COMPLETE' satisfies AssignmentStatus) : status
      },
      where: {
        id: assignment.id
      }
    });
    res.status(200).json({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

router.delete(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.remoteAssignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    await prisma.remoteAssignmentModel.delete({
      where: { id }
    });
    res.status(200).json({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

export { router as apiRouter };
