import axios from 'axios';

/**
 * Extract a human-readable message from an API error. Prefers the server-provided `message` field on
 * the response body (e.g. NestJS exception messages), falling back to the provided default. Written
 * with explicit narrowing so the `unknown` response body stays type-safe.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  }
  return fallback;
}
