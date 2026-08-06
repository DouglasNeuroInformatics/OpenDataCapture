import { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/store', () => ({
  useAppStore: Object.assign(vi.fn(), { getState: () => ({ accessToken: null }) })
}));

vi.mock('@/config', () => ({
  config: { dev: { networkLatency: 0 }, setup: { apiBaseUrl: 'http://localhost' } }
}));

const { isTransientError } = await import('@/services/axios');

function errorWithResponse(status: number, data: unknown): AxiosError {
  const response = { config: {}, data, headers: {}, status, statusText: '' } as AxiosResponse;
  return new AxiosError('failed', 'ERR_BAD_RESPONSE', { headers: new AxiosHeaders() }, null, response);
}

describe('isTransientError', () => {
  it('should treat a request that never got a response as transient, so the retry budget applies', () => {
    expect(isTransientError(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(true);
  });

  // A proxy in front of the API answers with HTML or nothing, which is the blip retrying exists for.
  it('should treat a gateway status without an api error body as transient', () => {
    expect(isTransientError(errorWithResponse(502, '<html>Bad Gateway</html>'))).toBe(true);
    expect(isTransientError(errorWithResponse(503, undefined))).toBe(true);
  });

  // The API returning 502 because the remote-assignment gateway refused it is a deliberate answer:
  // showing "Connection Problem, this is usually temporary" would send the user to retry forever.
  it('should not treat a gateway status carrying an api error body as transient', () => {
    expect(isTransientError(errorWithResponse(502, { message: 'Gateway refused', statusCode: 502 }))).toBe(false);
    expect(isTransientError(errorWithResponse(503, { message: 'Failed to reach gateway', statusCode: 503 }))).toBe(
      false
    );
  });

  it('should not treat a client error as transient', () => {
    expect(isTransientError(errorWithResponse(404, { message: 'Not Found', statusCode: 404 }))).toBe(false);
  });

  it('should not treat a non-axios error as transient', () => {
    expect(isTransientError(new Error('boom'))).toBe(false);
  });
});
