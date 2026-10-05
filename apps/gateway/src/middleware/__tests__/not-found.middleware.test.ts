import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { notFoundMiddleware } from '../not-found.middleware';

function createResponse() {
  const end = vi.fn();
  const set = vi.fn(() => ({ end }));
  const status = vi.fn(() => ({ set }));
  return { end, response: { status } as unknown as Response, set, status };
}

describe('notFoundMiddleware', () => {
  it('should respond with a 404 status', () => {
    const { response, status } = createResponse();
    notFoundMiddleware({} as Request, response, vi.fn());
    expect(status).toHaveBeenCalledWith(404);
  });

  it('should send an HTML page, so a browser renders the message rather than showing raw text', () => {
    const { end, response, set } = createResponse();
    notFoundMiddleware({} as Request, response, vi.fn());
    expect(set).toHaveBeenCalledWith({ 'Content-Type': 'text/html' });
    expect(end).toHaveBeenCalledWith(expect.stringContaining('<h1>404 - Not Found</h1>'));
  });
});
