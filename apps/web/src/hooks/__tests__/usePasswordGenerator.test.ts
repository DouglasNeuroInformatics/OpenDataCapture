import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePasswordGenerator } from '../usePasswordGenerator';

describe('usePasswordGenerator', () => {
  it('should report a password as generated only while it is still the one that was generated', () => {
    const { result } = renderHook(() => usePasswordGenerator());

    expect(result.current.isGeneratedPassword('pilot-cargo-vivid-mural-badge')).toBe(false);

    let generated = '';
    act(() => {
      generated = result.current.generatePassword();
    });

    expect(result.current.generatedPassword).toBe(generated);
    expect(result.current.isGeneratedPassword(generated)).toBe(true);
    // An administrator who types over the generated value is choosing the password themselves, which
    // is what decides `mustResetPassword` at submission.
    expect(result.current.isGeneratedPassword('something-they-typed')).toBe(false);
    expect(result.current.isGeneratedPassword(undefined)).toBe(false);
  });

  it('should track only the most recent value, so regenerating discards the previous one', () => {
    const { result } = renderHook(() => usePasswordGenerator());

    let first = '';
    act(() => {
      first = result.current.generatePassword();
    });
    let second = '';
    act(() => {
      second = result.current.generatePassword();
    });

    expect(second).not.toBe(first);
    expect(result.current.isGeneratedPassword(first)).toBe(false);
    expect(result.current.isGeneratedPassword(second)).toBe(true);
  });

  it('should fill both password fields, since the field itself only writes the first', () => {
    const { result } = renderHook(() => usePasswordGenerator());
    let generated = '';
    act(() => {
      generated = result.current.generatePassword();
    });

    let values = { password: 'stale', username: 'jane.doe' };
    act(() => result.current.applyGeneratedPassword((update) => (values = (update as any)(values))));

    expect(values).toStrictEqual({ confirmPassword: generated, password: generated, username: 'jane.doe' });
  });

  it('should leave the form alone before anything has been generated', () => {
    const { result } = renderHook(() => usePasswordGenerator());
    let called = false;
    act(() => result.current.applyGeneratedPassword(() => (called = true) as any));
    expect(called).toBe(false);
  });
});
