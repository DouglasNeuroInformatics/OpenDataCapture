import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { ah } from '../async-handler';

describe('ah', () => {
  it('should pass the request, response and next function through to the wrapped handler, so it behaves like a plain express handler', () => {
    const fn = vi.fn<(req: Request, res: Response, next: NextFunction) => Promise<void>>(() => Promise.resolve());
    const next = vi.fn();
    ah(fn)(express.request, express.response, next);
    const [req, res, nextArg] = fn.mock.calls[0]!;
    expect(req).toBe(express.request);
    expect(res).toBe(express.response);
    expect(nextArg).toBe(next);
  });

  it('should not call next when the handler resolves, so a sent response is not followed by another', async () => {
    const next = vi.fn();
    const fn = vi.fn(() => Promise.resolve('done'));
    ah(fn)(express.request, express.response, next);
    await expect(fn.mock.results[0]!.value).resolves.toBe('done');
    expect(next).not.toHaveBeenCalled();
  });

  it('should forward a rejection to next, so express reaches the error handler instead of an unhandled rejection', async () => {
    const error = new Error('boom');
    const next = vi.fn();
    ah(() => Promise.reject(error))(express.request, express.response, next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });

  it('should return nothing, so express does not treat the handler as returning a promise', () => {
    const handler = ah(() => Promise.resolve());
    expect(handler(express.request, express.response, vi.fn())).toBeUndefined();
  });
});
