import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from '@/logger';
import { HttpException } from '@/utils/http-exception';

import { errorHandlerMiddleware } from '../error-handler.middleware';

function createResponse({ headersSent }: { headersSent: boolean }) {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));
  return { response: { headersSent, status } as unknown as Response, send, status };
}

describe('errorHandlerMiddleware', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log every error, so failures are visible in the server output', () => {
    const error = new Error('boom');
    errorHandlerMiddleware(error, {} as Request, createResponse({ headersSent: false }).response, vi.fn());
    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it('should hand the error to the next handler once headers are sent, since a second response cannot be written', () => {
    const error = new HttpException(400, 'Bad Request');
    const next = vi.fn();
    const { response, status } = createResponse({ headersSent: true });
    errorHandlerMiddleware(error, {} as Request, response, next);
    expect(next).toHaveBeenCalledWith(error);
    expect(status).not.toHaveBeenCalled();
  });

  it('should respond with the status and message of an HTTP exception', () => {
    const { response, send, status } = createResponse({ headersSent: false });
    errorHandlerMiddleware(new HttpException(401, 'Unauthorized'), {} as Request, response, vi.fn());
    expect(status).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({ message: 'Unauthorized', statusCode: 401 });
  });

  it('should respond with a generic 500 for any other error, so internal details are not leaked to the client', () => {
    const { response, send, status } = createResponse({ headersSent: false });
    errorHandlerMiddleware(new Error('database password is hunter2'), {} as Request, response, vi.fn());
    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith({ message: 'Internal Server Error', statusCode: 500 });
  });
});
