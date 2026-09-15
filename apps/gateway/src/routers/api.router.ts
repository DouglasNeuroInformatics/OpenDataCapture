import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import {
  $CreateRemoteAssignmentData,
  $CreateRemoteAssignmentsData,
  $UpdateRemoteAssignmentData
} from '@opendatacapture/schemas/assignment';
import type {
  AssignmentStatus,
  MutateAssignmentResponseBody,
  RemoteAssignment
} from '@opendatacapture/schemas/assignment';
import { $RemoteSetupState } from '@opendatacapture/schemas/gateway';
import type { GatewayHealthcheckSuccessResult } from '@opendatacapture/schemas/gateway';
import { Router } from 'express';

import { clearAssignmentVerification, isAssignmentVerified } from '@/lib/assignment-verification';
import { prisma } from '@/lib/prisma';
import { updateSetupState } from '@/lib/setup-state';
import { logger } from '@/logger';
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
      logger.error(result.error.issues);
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

// Declared before `/assignments/:id` so `bulk` is not captured as an id by the routes below.
router.post(
  '/assignments/bulk',
  ah(async (req, res) => {
    const result = await $CreateRemoteAssignmentsData.safeParseAsync(req.body);
    if (!result.success) {
      logger.error(result.error.issues);
      throw new HttpException(400, 'Bad Request');
    }
    const { assignments, instruments } = result.data;

    const containerByInstrumentId = new Map(
      instruments.map(({ instrumentContainer, instrumentId }) => [instrumentId, instrumentContainer])
    );
    // Resolve every bundle before writing anything: a batch referencing an instrument the caller
    // did not send is a malformed request, not a partially valid one.
    const records = assignments.map(({ instrumentId, publicKey, ...assignment }) => {
      const instrumentContainer = containerByInstrumentId.get(instrumentId);
      if (!instrumentContainer) {
        throw new HttpException(400, `Missing instrument container for assignment: ${assignment.id}`);
      }
      return {
        ...assignment,
        rawPublicKey: Buffer.from(publicKey),
        targetStringified: JSON.stringify(instrumentContainer)
      };
    });

    // All-or-nothing: the core API deletes its own staged rows when this call fails, so a batch
    // that half-succeeded here would leave assignment links live with no record on the other side.
    await prisma.$transaction(records.map((data) => prisma.remoteAssignmentModel.create({ data })));

    res.status(201).send({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

router.patch(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id as string;

    if (!isAssignmentVerified(id)) {
      throw new HttpException(403, 'Assignment has not passed human verification');
    }

    const assignment = await prisma.remoteAssignmentModel.findFirst({
      where: { id }
    });
    if (!assignment) {
      throw new HttpException(404, `Failed to Find Assignment with ID: ${id}`);
    }
    const result = await $UpdateRemoteAssignmentData.safeParseAsync(req.body);
    if (!result.success) {
      logger.error(result.error.issues);
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
    if (status === 'COMPLETE') {
      clearAssignmentVerification(assignment.id);
    }
    res.status(200).json({ success: true } satisfies MutateAssignmentResponseBody);
  })
);

router.delete(
  '/assignments/:id',
  ah(async (req, res) => {
    const id = req.params.id as string;
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

// A full replacement rather than a patch, so a retry, a duplicate and the periodic reconcile in
// `apps/api` are all the same request.
router.put(
  '/setup-state',
  ah(async (req, res) => {
    const result = await $RemoteSetupState.safeParseAsync(req.body);
    if (!result.success) {
      logger.error(result.error.issues);
      throw new HttpException(400, 'Bad Request');
    }
    updateSetupState(result.data);
    res.status(204).end();
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
