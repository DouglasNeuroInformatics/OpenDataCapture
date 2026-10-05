import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { generateToken } from '@/utils/auth';
import { HttpException } from '@/utils/http-exception';

import { apiKeyMiddleware } from '../api-key.middleware';

const { API_KEY } = vi.hoisted(() => ({ API_KEY: 'k'.repeat(32) }));

vi.mock('@/config', () => ({ config: { apiKey: API_KEY } }));

function createRequest({
  authorization,
  method = 'GET',
  originalUrl
}: {
  authorization?: string;
  method?: string;
  originalUrl: string;
}) {
  return { headers: { authorization }, method, originalUrl } as Request;
}

function runMiddleware(request: Request) {
  const next = vi.fn();
  apiKeyMiddleware(request, {} as Response, next);
  return next;
}

describe('apiKeyMiddleware', () => {
  it('should let a health check through without a key, so monitoring needs no credentials', () => {
    const next = runMiddleware(createRequest({ originalUrl: '/api/healthcheck' }));
    expect(next).toHaveBeenCalledOnce();
  });

  it('should let a request through when it carries the API key as a bearer token', () => {
    const next = runMiddleware(createRequest({ authorization: `Bearer ${API_KEY}`, originalUrl: '/api/assignments' }));
    expect(next).toHaveBeenCalledOnce();
  });

  it('should match the bearer scheme case-insensitively, as HTTP auth schemes are', () => {
    const next = runMiddleware(createRequest({ authorization: `bearer ${API_KEY}`, originalUrl: '/api/assignments' }));
    expect(next).toHaveBeenCalledOnce();
  });

  it('should reject a request without an authorization header', () => {
    expect(() => runMiddleware(createRequest({ originalUrl: '/api/assignments' }))).toThrow(
      new HttpException(401, 'Unauthorized')
    );
  });

  it('should reject the API key sent under a scheme other than bearer', () => {
    const request = createRequest({ authorization: `Basic ${API_KEY}`, originalUrl: '/api/assignments' });
    expect(() => runMiddleware(request)).toThrow(new HttpException(401, 'Unauthorized'));
  });

  it('should reject an assignment token on anything but a PATCH, so a patient cannot read assignments', () => {
    const request = createRequest({
      authorization: `Bearer ${generateToken('assignment-1')}`,
      originalUrl: '/api/assignments/assignment-1'
    });
    expect(() => runMiddleware(request)).toThrow(new HttpException(401, 'Unauthorized'));
  });

  it('should reject a PATCH to the assignments collection itself, which names no assignment to authorize', () => {
    const request = createRequest({ authorization: 'Bearer token', method: 'PATCH', originalUrl: '/api/assignments/' });
    expect(() => runMiddleware(request)).toThrow(new HttpException(401, 'Unauthorized'));
  });

  it("should let a patient PATCH their assignment with that assignment's token", () => {
    const request = createRequest({
      authorization: `Bearer ${generateToken('assignment-1')}`,
      method: 'PATCH',
      originalUrl: '/api/assignments/assignment-1'
    });
    expect(runMiddleware(request)).toHaveBeenCalledOnce();
  });

  it("should reject a PATCH carrying another assignment's token, so one link cannot update another assignment", () => {
    const request = createRequest({
      authorization: `Bearer ${generateToken('assignment-2')}`,
      method: 'PATCH',
      originalUrl: '/api/assignments/assignment-1'
    });
    expect(() => runMiddleware(request)).toThrow(new HttpException(401, 'Unauthorized'));
  });
});
