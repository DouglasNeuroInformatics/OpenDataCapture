import type { Server } from 'http';

import type Cap from '@cap.js/server';
import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { isAssignmentVerified } from '@/lib/assignment-verification';
import { errorHandlerMiddleware } from '@/middleware/error-handler.middleware';

import { $VerifyRequest, capRouter } from '../cap.router';

const { cap } = vi.hoisted(() => ({
  cap: {
    createChallenge: vi.fn<Cap['createChallenge']>(),
    redeemChallenge: vi.fn<Cap['redeemChallenge']>(),
    validateToken: vi.fn<Cap['validateToken']>()
  }
}));

const challenge = { challenge: { c: 1, d: 4, s: 2 }, expires: 1_000, token: 'challenge-token' };

vi.mock('@/lib/cap', () => ({ cap }));
vi.mock('@/logger', () => ({ logger: { error: vi.fn() } }));

let baseUrl: string;
let server: Server;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', capRouter);
  app.use(errorHandlerMiddleware);
  server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const address = server.address();
  if (typeof address !== 'object' || address === null) {
    throw new Error('Expected the test server to listen on a TCP port');
  }
  baseUrl = `http://127.0.0.1:${address.port}/api/auth`;
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  vi.clearAllMocks();
});

function post(path: string, body: unknown) {
  return fetch(`${baseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  });
}

describe('$VerifyRequest', () => {
  it('should accept an assignment id, so a real assignment can be verified', () => {
    expect($VerifyRequest.safeParse({ id: crypto.randomUUID(), token: 'token' }).success).toBe(true);
  });

  it('should reject an id longer than any assignment id, since a verified id is kept for the life of the process', () => {
    expect($VerifyRequest.safeParse({ id: 'x'.repeat(10_000), token: 'token' }).success).toBe(false);
  });
});

describe('POST /challenge', () => {
  it('should respond with the challenge Cap resolves, not the pending promise, so the widget has a challenge to solve', async () => {
    cap.createChallenge.mockResolvedValueOnce(challenge);
    const response = await post('/challenge', {});
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(challenge);
  });

  it('should issue a challenge that expires in five minutes, so a stale challenge cannot be solved later', async () => {
    cap.createChallenge.mockResolvedValueOnce(challenge);
    await post('/challenge', {});
    expect(cap.createChallenge).toHaveBeenCalledWith({ challengeDifficulty: 4, expiresMs: 300_000 });
  });
});

describe('POST /redeem', () => {
  it('should reject a malformed solution without consulting Cap', async () => {
    const response = await post('/redeem', { solutions: 'not-an-array', token: 'token' });
    expect(response.status).toBe(400);
    expect(cap.redeemChallenge).not.toHaveBeenCalled();
  });

  it('should return the result of redeeming the solution with Cap', async () => {
    cap.redeemChallenge.mockResolvedValueOnce({ success: true, token: 'redeemed-token' });
    const response = await post('/redeem', { solutions: [1, 2, 3], token: 'token' });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, token: 'redeemed-token' });
    expect(cap.redeemChallenge).toHaveBeenCalledWith({ solutions: [1, 2, 3], token: 'token' });
  });
});

describe('POST /verify', () => {
  it('should reject a request without a token before validating anything', async () => {
    const response = await post('/verify', { id: 'assignment-1' });
    expect(response.status).toBe(400);
    expect(cap.validateToken).not.toHaveBeenCalled();
  });

  it('should refuse an invalid token without marking the assignment verified, so a bot cannot submit', async () => {
    cap.validateToken.mockResolvedValueOnce({ success: false });
    const response = await post('/verify', { id: 'assignment-invalid', token: 'bad-token' });
    expect(response.status).toBe(403);
    expect(isAssignmentVerified('assignment-invalid')).toBe(false);
  });

  it('should mark the assignment verified once its token is valid, so later submissions need no token', async () => {
    cap.validateToken.mockResolvedValueOnce({ success: true });
    const response = await post('/verify', { id: 'assignment-valid', token: 'good-token' });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(cap.validateToken).toHaveBeenCalledWith('good-token');
    expect(isAssignmentVerified('assignment-valid')).toBe(true);
  });
});
