import { describe, expect, it } from 'vitest';

import { HttpException } from '../http-exception';

describe('HttpException', () => {
  it('should carry the status code, so the error handler can respond with it', () => {
    expect(new HttpException(404, 'Not Found').status).toBe(404);
  });

  it('should carry the message, so the error handler can include it in the response body', () => {
    expect(new HttpException(401, 'Unauthorized').message).toBe('Unauthorized');
  });

  it('should be an Error, so it propagates through express like any thrown error', () => {
    expect(new HttpException(500, 'Internal Server Error')).toBeInstanceOf(Error);
  });
});
