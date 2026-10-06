import type { Server } from 'http';

import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import type { DecryptParams } from '@douglasneuroinformatics/libcrypto';
import { $CreateRemoteAssignmentsData } from '@opendatacapture/schemas/assignment';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';
import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { isAssignmentVerified, markAssignmentVerified } from '@/lib/assignment-verification';
import { getActiveLanguages } from '@/lib/setup-state';
import { errorHandlerMiddleware } from '@/middleware/error-handler.middleware';

import { apiRouter } from '../api.router';

const { logger, prisma } = vi.hoisted(() => ({
  logger: { error: vi.fn() },
  prisma: {
    $transaction: vi.fn(),
    remoteAssignmentModel: {
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/logger', () => ({ logger }));

const release: ReleaseInfo = { buildTime: 0, type: 'production', version: '1.0.0' };

const instrumentContainer = {
  bundle: 'export default {}',
  id: 'instrument-1',
  kind: 'FORM'
};

const assignment = {
  completedAt: null,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  groupId: 'group-1',
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  publicKey: [1, 2, 3],
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  url: 'http://localhost:3500/assignments/assignment-1'
};

let baseUrl: string;
let server: Server;

beforeAll(async () => {
  vi.stubGlobal('__RELEASE__', release);
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(errorHandlerMiddleware);
  server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const address = server.address();
  if (typeof address !== 'object' || address === null) {
    throw new Error('Expected the test server to listen on a TCP port');
  }
  baseUrl = `http://127.0.0.1:${address.port}/api`;
});

afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
});

function request(method: string, path: string, body?: unknown) {
  return fetch(`${baseUrl}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method
  });
}

async function createStoredAssignment(
  id: string,
  stored: { encryptedData: null | string; symmetricKey: null | string }
) {
  const keyPair = await HybridCrypto.generateKeyPair();
  prisma.remoteAssignmentModel.findFirst.mockResolvedValueOnce({
    ...stored,
    getPublicKey: () => Promise.resolve(keyPair.publicKey),
    id
  });
  return keyPair;
}

function decrypt(privateKey: DecryptParams['privateKey'], encryptedData: string, symmetricKey: string) {
  return HybridCrypto.decrypt({
    cipherText: Buffer.from(encryptedData, 'base64'),
    privateKey,
    symmetricKey: Buffer.from(symmetricKey, 'base64')
  });
}

describe('$CreateRemoteAssignmentsData', () => {
  it('should accept a batch carrying one container for many assignments, so a bundle is not repeated per row', () => {
    const result = $CreateRemoteAssignmentsData.safeParse({
      assignments: [
        assignment,
        { ...assignment, id: 'assignment-2', subjectId: 'subject-2' },
        { ...assignment, id: 'assignment-3', subjectId: 'subject-3' }
      ],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(result.success).toBe(true);
    expect(result.data?.instruments).toHaveLength(1);
    expect(result.data?.assignments).toHaveLength(3);
  });

  it('should reject a batch with no assignments, so an empty request is not a silent no-op', () => {
    const result = $CreateRemoteAssignmentsData.safeParse({
      assignments: [],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(result.success).toBe(false);
  });

  it('should reject a batch with no instruments, since every assignment resolves its bundle by id', () => {
    const result = $CreateRemoteAssignmentsData.safeParse({ assignments: [assignment], instruments: [] });
    expect(result.success).toBe(false);
  });

  it('should reject an assignment that names no instrument, which could not be paired to a container', () => {
    const { instrumentId: _instrumentId, ...withoutInstrument } = assignment;
    const result = $CreateRemoteAssignmentsData.safeParse({
      assignments: [withoutInstrument],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(result.success).toBe(false);
  });
});

describe('GET /assignments', () => {
  it('should list every assignment, since the API reconciles the whole set on each sync', async () => {
    prisma.remoteAssignmentModel.findMany.mockResolvedValueOnce([{ id: 'assignment-1', status: 'OUTSTANDING' }]);
    const response = await request('GET', '/assignments');
    expect(await response.json()).toEqual([{ id: 'assignment-1', status: 'OUTSTANDING' }]);
    expect(prisma.remoteAssignmentModel.findMany).toHaveBeenCalledWith();
  });
});

describe('POST /assignments', () => {
  it('should reject an invalid assignment without writing anything', async () => {
    const response = await request('POST', '/assignments', { id: 'assignment-1' });
    expect(response.status).toBe(400);
    expect(logger.error).toHaveBeenCalled();
    expect(prisma.remoteAssignmentModel.create).not.toHaveBeenCalled();
  });

  it('should store the public key as bytes and the container as JSON, since SQLite has neither column type', async () => {
    const { instrumentId: _instrumentId, ...remoteAssignment } = assignment;
    const response = await request('POST', '/assignments', { ...remoteAssignment, instrumentContainer });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true });
    const { data } = prisma.remoteAssignmentModel.create.mock.lastCall![0];
    expect(data).toMatchObject({ id: 'assignment-1', rawPublicKey: Buffer.from([1, 2, 3]) });
    expect(JSON.parse(data.targetStringified)).toEqual(instrumentContainer);
  });
});

describe('POST /assignments/bulk', () => {
  it('should reject a malformed batch without writing anything', async () => {
    const response = await request('POST', '/assignments/bulk', { assignments: [] });
    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should reject a batch referencing an instrument it did not send, so no assignment is half-created', async () => {
    const response = await request('POST', '/assignments/bulk', {
      assignments: [assignment, { ...assignment, id: 'assignment-2', instrumentId: 'instrument-2' }],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: 'Missing instrument container for assignment: assignment-2'
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should write every assignment in one transaction, so a failure leaves none behind', async () => {
    prisma.remoteAssignmentModel.create.mockReturnValueOnce('assignment-1').mockReturnValueOnce('assignment-2');
    const response = await request('POST', '/assignments/bulk', {
      assignments: [assignment, { ...assignment, id: 'assignment-2' }],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(response.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalledWith(['assignment-1', 'assignment-2']);
    const { data } = prisma.remoteAssignmentModel.create.mock.lastCall![0];
    expect(data).toMatchObject({ id: 'assignment-2', rawPublicKey: Buffer.from([1, 2, 3]) });
    expect(JSON.parse(data.targetStringified)).toEqual(instrumentContainer);
  });
});

describe('PATCH /assignments/:id', () => {
  it('should refuse an assignment that has not passed human verification', async () => {
    const response = await request('PATCH', '/assignments/unverified', { kind: 'SCALAR' });
    expect(response.status).toBe(403);
    expect(prisma.remoteAssignmentModel.findFirst).not.toHaveBeenCalled();
  });

  it('should respond with not found for a verified id with no assignment, so a deleted assignment cannot be written to', async () => {
    markAssignmentVerified('missing');
    prisma.remoteAssignmentModel.findFirst.mockResolvedValueOnce(null);
    const response = await request('PATCH', '/assignments/missing', { kind: 'SCALAR' });
    expect(response.status).toBe(404);
  });

  it('should reject an invalid update without writing anything', async () => {
    markAssignmentVerified('invalid-body');
    await createStoredAssignment('invalid-body', { encryptedData: null, symmetricKey: null });
    const response = await request('PATCH', '/assignments/invalid-body', { kind: 'UNKNOWN' });
    expect(response.status).toBe(400);
    expect(prisma.remoteAssignmentModel.update).not.toHaveBeenCalled();
  });

  it('should replace the data of a scalar assignment with ciphertext only its owner can decrypt', async () => {
    markAssignmentVerified('scalar');
    const { privateKey } = await createStoredAssignment('scalar', { encryptedData: 'old', symmetricKey: 'old' });
    const response = await request('PATCH', '/assignments/scalar', { data: { score: 1 }, kind: 'SCALAR' });
    expect(response.status).toBe(200);
    const { data } = prisma.remoteAssignmentModel.update.mock.lastCall![0];
    expect(await decrypt(privateKey, data.encryptedData, data.symmetricKey)).toBe(JSON.stringify({ score: 1 }));
  });

  it('should keep an in-progress assignment verified and undated, so the patient can keep submitting', async () => {
    markAssignmentVerified('in-progress');
    await createStoredAssignment('in-progress', { encryptedData: null, symmetricKey: null });
    await request('PATCH', '/assignments/in-progress', { data: 1, kind: 'SCALAR' });
    expect(prisma.remoteAssignmentModel.update.mock.lastCall![0].data.completedAt).toBeUndefined();
    expect(isAssignmentVerified('in-progress')).toBe(true);
  });

  it('should date a completed assignment and forget its verification, so it cannot be submitted again', async () => {
    markAssignmentVerified('complete');
    await createStoredAssignment('complete', { encryptedData: null, symmetricKey: null });
    await request('PATCH', '/assignments/complete', { data: 1, kind: 'SCALAR', status: 'COMPLETE' });
    expect(prisma.remoteAssignmentModel.update).toHaveBeenCalledWith({
      data: expect.objectContaining({ completedAt: expect.any(Date), status: 'COMPLETE' }),
      where: { id: 'complete' }
    });
    expect(isAssignmentVerified('complete')).toBe(false);
  });

  it('should start a series with a leading separator, so the first item is counted as submitted', async () => {
    markAssignmentVerified('series-first');
    const { privateKey } = await createStoredAssignment('series-first', { encryptedData: null, symmetricKey: null });
    await request('PATCH', '/assignments/series-first', { data: { item: 1 }, kind: 'SERIES' });
    const { data } = prisma.remoteAssignmentModel.update.mock.lastCall![0];
    const [emptyData, cipherText] = data.encryptedData.split('$');
    const [emptyKey, symmetricKey] = data.symmetricKey.split('$');
    expect([emptyData, emptyKey]).toEqual(['', '']);
    expect(await decrypt(privateKey, cipherText, symmetricKey)).toBe(JSON.stringify({ item: 1 }));
  });

  it('should append a series item to the items already stored rather than replacing them', async () => {
    markAssignmentVerified('series-next');
    await createStoredAssignment('series-next', { encryptedData: '$data-1', symmetricKey: '$key-1' });
    await request('PATCH', '/assignments/series-next', { data: { item: 2 }, kind: 'SERIES' });
    const { data } = prisma.remoteAssignmentModel.update.mock.lastCall![0];
    expect(data.encryptedData).toMatch(/^\$data-1\$[^$]+$/);
    expect(data.symmetricKey).toMatch(/^\$key-1\$[^$]+$/);
  });
});

describe('DELETE /assignments/:id', () => {
  it('should respond with not found without deleting anything when the assignment does not exist', async () => {
    prisma.remoteAssignmentModel.findFirst.mockResolvedValueOnce(null);
    const response = await request('DELETE', '/assignments/missing');
    expect(response.status).toBe(404);
    expect(prisma.remoteAssignmentModel.delete).not.toHaveBeenCalled();
  });

  it('should delete an existing assignment, so its link stops working once the API withdraws it', async () => {
    prisma.remoteAssignmentModel.findFirst.mockResolvedValueOnce({ id: 'assignment-1' });
    const response = await request('DELETE', '/assignments/assignment-1');
    expect(response.status).toBe(200);
    expect(prisma.remoteAssignmentModel.delete).toHaveBeenCalledWith({ where: { id: 'assignment-1' } });
  });
});

describe('PUT /setup-state', () => {
  it('should reject an invalid setup state and keep the current one', async () => {
    const before = getActiveLanguages();
    const response = await request('PUT', '/setup-state', { activeLanguages: [] });
    expect(response.status).toBe(400);
    expect(getActiveLanguages()).toEqual(before);
  });

  it('should replace the setup state with the one pushed by the API', async () => {
    const response = await request('PUT', '/setup-state', { activeLanguages: ['es'] });
    expect(response.status).toBe(204);
    expect(getActiveLanguages()).toEqual(['es']);
  });
});

describe('GET /healthcheck', () => {
  it('should report the release the gateway was built from, so the API can detect a version mismatch', async () => {
    const response = await request('GET', '/healthcheck');
    expect(await response.json()).toEqual({ ok: true, release, status: 200, uptime: expect.any(Number) });
  });
});
