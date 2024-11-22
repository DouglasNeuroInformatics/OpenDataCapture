import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import {
  $CreateRemoteAssignmentData,
  $UpdateRemoteAssignmentData,
  type RemoteAssignment
} from '@opendatacapture/schemas/assignment';
import type { AssignmentStatus, MutateAssignmentResponseBody } from '@opendatacapture/schemas/assignment';
import type { GatewayHealthcheckSuccessResult } from '@opendatacapture/schemas/gateway';
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
      assignments.map((assignment) => {
        return {
          ...assignment,
          status: assignment.status as AssignmentStatus
        };
      }) satisfies RemoteAssignment[]
    );
  })
);

router.post(
  '/assignments',
  ah(async (req, res) => {
    const result = await $CreateRemoteAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      console.error(result.error.issues);
      throw new HttpException(400, 'Bad Request');
    }
    const { instrumentContainer, publicKey, ...assignment } = result.data;

    await prisma.remoteAssignmentModel.create({
      data: {
        ...assignment,
        rawPublicKey: Buffer.from(publicKey),
        targetStringified: JSON.stringify(instrumentContainer)
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
    const result = await $UpdateRemoteAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      console.error(result.error.issues);
      throw new HttpException(400, 'Bad Request');
    }
    const { data, kind, status } = result.data;
    const publicKey = await assignment.getPublicKey();

    const encryptResult = await HybridCrypto.encrypt({
      plainText: JSON.stringify(data),
      publicKey
    });

    let encryptedData: string, symmetricKey: string;
    if (kind === 'SCALAR') {
      encryptedData = Buffer.from(encryptResult.cipherText).toString('base64');
      symmetricKey = Buffer.from(encryptResult.symmetricKey).toString('base64');
    } else {
      encryptedData = (assignment.encryptedData ?? '').concat(
        '$',
        Buffer.from(encryptResult.cipherText).toString('base64')
      );
      symmetricKey = (assignment.symmetricKey ?? '').concat(
        '$',
        Buffer.from(encryptResult.symmetricKey).toString('base64')
      );
    }

    await prisma.remoteAssignmentModel.update({
      data: {
        completedAt: status === 'COMPLETE' ? new Date() : undefined,
        encryptedData,
        status,
        symmetricKey
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

router.get('/healthcheck', (_, res) => {
  res.status(200).json({
    ok: true,
    release: __RELEASE__,
    status: 200,
    uptime: Math.round(process.uptime())
  } satisfies GatewayHealthcheckSuccessResult);
});

export { router as apiRouter };
