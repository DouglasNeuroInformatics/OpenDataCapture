import type { MailErrorCode } from '@opendatacapture/schemas/mail';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMailErrorMessage } from '../useMailErrorMessage';

import '@/services/i18n';

const CODES: MailErrorCode[] = [
  'AUTHENTICATION_FAILED',
  'HOST_NOT_FOUND',
  'CONNECTION_REFUSED',
  'INSECURE_CONNECTION',
  'SENDER_REJECTED',
  'PASSWORD_REQUIRED',
  'UNKNOWN'
];

describe('useMailErrorMessage', () => {
  // Each code exists to tell the admin a different thing to fix; two codes sharing copy would
  // collapse that distinction.
  it('renders a distinct, non-empty message for every code', () => {
    const { result } = renderHook(() => useMailErrorMessage());
    const messages = CODES.map((code) => result.current(code));
    expect(messages.every((message) => message.length > 0)).toBe(true);
    expect(new Set(messages).size).toBe(CODES.length);
  });

  it('falls back to the UNKNOWN copy for a nullish code', () => {
    const { result } = renderHook(() => useMailErrorMessage());
    expect(result.current(null)).toBe(result.current('UNKNOWN'));
    expect(result.current(undefined)).toBe(result.current('UNKNOWN'));
  });
});
