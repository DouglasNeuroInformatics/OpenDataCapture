import type { Server } from 'http';

import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { updateSetupState } from '@/lib/setup-state';
import type { RootProps } from '@/Root';
import { generateToken } from '@/utils/auth';

import { rootRouter } from '../root.router';

const { loadRoot, logger, prisma } = vi.hoisted(() => ({
  loadRoot: vi.fn((props: unknown) => JSON.stringify(props)),
  logger: { error: vi.fn() },
  prisma: { remoteAssignmentModel: { findFirst: vi.fn() } }
}));

vi.mock('@/config', () => ({ config: { apiKey: 'k'.repeat(32) } }));
vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/logger', () => ({ logger }));

const target = { bundle: 'export default {}', id: 'instrument-1', kind: 'FORM' };

let baseUrl: string;
let server: Server;

beforeAll(async () => {
  const app = express();
  app.use((_, res, next) => {
    res.locals.loadRoot = loadRoot;
    next();
  });
  app.use('/', rootRouter);
  server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const address = server.address();
  if (typeof address !== 'object' || address === null) {
    throw new Error('Expected the test server to listen on a TCP port');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  vi.clearAllMocks();
  updateSetupState({ activeLanguages: ['en', 'fr'] });
});

function storeAssignment(stored: { completedAt?: Date; encryptedData?: null | string; targetStringified?: string }) {
  prisma.remoteAssignmentModel.findFirst.mockResolvedValueOnce({
    completedAt: null,
    encryptedData: null,
    id: 'assignment-1',
    targetStringified: JSON.stringify(target),
    ...stored
  });
}

async function getRootProps(path: string): Promise<RootProps> {
  const response = await fetch(`${baseUrl}${path}`);
  return response.json();
}

describe('GET /assignments/:id', () => {
  it('should fall through to not found for an unknown assignment rather than render an empty page', async () => {
    prisma.remoteAssignmentModel.findFirst.mockResolvedValueOnce(null);
    const response = await fetch(`${baseUrl}/assignments/missing`);
    expect(response.status).toBe(404);
    expect(loadRoot).not.toHaveBeenCalled();
  });

  it('should refuse a completed assignment, so a patient cannot submit it twice', async () => {
    storeAssignment({ completedAt: new Date() });
    const response = await fetch(`${baseUrl}/assignments/assignment-1`);
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: 'Conflict',
      message: 'Assignment already completed',
      statusCode: 409
    });
  });

  it('should fail with a server error when the stored instrument no longer parses', async () => {
    storeAssignment({ targetStringified: JSON.stringify({ id: 'instrument-1' }) });
    const response = await fetch(`${baseUrl}/assignments/assignment-1`);
    expect(response.status).toBe(500);
    expect(logger.error).toHaveBeenCalled();
    expect(loadRoot).not.toHaveBeenCalled();
  });

  it('should render the assignment with a token scoped to it, so the page can submit only this assignment', async () => {
    storeAssignment({});
    expect(await getRootProps('/assignments/assignment-1?lang=fr')).toEqual({
      activeLanguages: ['en', 'fr'],
      id: 'assignment-1',
      kind: 'assignment',
      language: 'fr',
      target,
      token: generateToken('assignment-1')
    });
  });

  it('should resume a series after the items already submitted', async () => {
    storeAssignment({ encryptedData: '$item-1$item-2' });
    expect(await getRootProps('/assignments/assignment-1')).toMatchObject({ initialSeriesIndex: 2 });
  });

  it('should not resume from data that was not written as a series', async () => {
    storeAssignment({ encryptedData: 'scalar-data' });
    expect(await getRootProps('/assignments/assignment-1')).not.toHaveProperty('initialSeriesIndex');
  });
});

describe('GET /', () => {
  it('should serve the rendered root as HTML', async () => {
    const response = await fetch(baseUrl);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toMatch(/^text\/html/);
  });

  it('should render the landing page in the first active language when none is requested', async () => {
    updateSetupState({ activeLanguages: ['fr', 'en'] });
    expect(await getRootProps('/')).toEqual({ activeLanguages: ['fr', 'en'], kind: 'landing', language: 'fr' });
  });
});
