import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { getApiErrorMessage } from '../error';

const FALLBACK = 'Something went wrong';

const axiosErrorWithBody = (data: unknown) =>
  new AxiosError('Request failed with status code 400', 'ERR_BAD_REQUEST', undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data,
    headers: {},
    status: 400,
    statusText: 'Bad Request'
  });

describe('getApiErrorMessage', () => {
  it('should return the message the server put on the response body', () => {
    expect(getApiErrorMessage(axiosErrorWithBody({ message: 'Username is taken' }), FALLBACK)).toBe(
      'Username is taken'
    );
  });

  it('should return the fallback for an error that is not from axios, so internal messages are not shown', () => {
    expect(getApiErrorMessage(new Error('Cannot read properties of undefined'), FALLBACK)).toBe(FALLBACK);
  });

  it('should return the fallback when the request never received a response', () => {
    expect(getApiErrorMessage(new AxiosError('Network Error', 'ERR_NETWORK'), FALLBACK)).toBe(FALLBACK);
  });

  it('should return the fallback when the response has no body', () => {
    expect(getApiErrorMessage(axiosErrorWithBody(null), FALLBACK)).toBe(FALLBACK);
  });

  it('should return the fallback when the body is plain text rather than an object', () => {
    expect(getApiErrorMessage(axiosErrorWithBody('Bad Gateway'), FALLBACK)).toBe(FALLBACK);
  });

  it('should return the fallback when the body carries no message', () => {
    expect(getApiErrorMessage(axiosErrorWithBody({ statusCode: 400 }), FALLBACK)).toBe(FALLBACK);
  });

  it('should return the fallback when the message is not a string, such as a list of validation errors', () => {
    expect(getApiErrorMessage(axiosErrorWithBody({ message: ['name must be a string'] }), FALLBACK)).toBe(FALLBACK);
  });
});
