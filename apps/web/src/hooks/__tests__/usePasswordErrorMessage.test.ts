import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, renderHook } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { usePasswordErrorMessage } from '../usePasswordErrorMessage';

import '@/services/i18n';

const FALLBACK = 'Something went wrong';

function rejection(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    config,
    data,
    headers: {},
    status,
    statusText: ''
  });
}

function messageFor(err: unknown) {
  const { result } = renderHook(() => usePasswordErrorMessage());
  return result.current(err, FALLBACK);
}

describe('usePasswordErrorMessage', () => {
  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
  });

  it.each([
    ['INSUFFICIENT_PASSWORD_STRENGTH', 'Insufficient password strength'],
    ['PASSWORD_IN_DATA_BREACH', 'This password has appeared in a known data breach and cannot be used'],
    ['PASSWORD_MATCHES_CURRENT', 'Password must not be the same as your current password'],
    ['PASSWORD_MATCHES_USERNAME', 'Password must not be the same as the username']
  ])('should explain the %s policy rejection with its own message', (code, message) => {
    expect(messageFor(rejection(400, { code }))).toBe(message);
  });

  it('should explain a policy rejection in the reader’s language', () => {
    i18n.changeLanguage('fr');
    expect(messageFor(rejection(400, { code: 'INSUFFICIENT_PASSWORD_STRENGTH' }))).toBe('Mot de passe trop faible');
  });

  it('should fall back for an error that did not come from axios', () => {
    expect(messageFor(new Error('boom'))).toBe(FALLBACK);
  });

  it('should fall back for a request that never received a response', () => {
    expect(messageFor(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(FALLBACK);
  });

  it('should fall back for a status other than 400, since only bad requests carry a policy code', () => {
    expect(messageFor(rejection(500, { code: 'INSUFFICIENT_PASSWORD_STRENGTH' }))).toBe(FALLBACK);
  });

  it('should fall back for a bad request with a code outside the password policy', () => {
    expect(messageFor(rejection(400, { code: 'USERNAME_TAKEN' }))).toBe(FALLBACK);
  });

  it.each([
    ['a string body', 'Bad Request'],
    ['a null body', null],
    ['a body without a code', { message: 'Bad Request' }],
    ['a non-string code', { code: 400 }]
  ])('should fall back for a bad request with %s', (_description, data) => {
    expect(messageFor(rejection(400, data))).toBe(FALLBACK);
  });
});
