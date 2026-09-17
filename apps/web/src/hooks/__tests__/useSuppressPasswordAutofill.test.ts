import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSuppressPasswordAutofill } from '../useSuppressPasswordAutofill';

const renderContainer = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

describe('useSuppressPasswordAutofill', () => {
  it('should mark every password field as a new password, which is what stops the saved one being filled in', () => {
    const container = renderContainer('<input type="password" /><input type="password" />');
    const { result } = renderHook(() => useSuppressPasswordAutofill());

    result.current(container);

    for (const input of container.querySelectorAll('input')) {
      expect(input.getAttribute('autocomplete')).toBe('new-password');
    }
  });

  it('should leave other fields alone, so nothing overrides what they declare themselves', () => {
    const container = renderContainer('<input autocomplete="off" type="text" />');
    const { result } = renderHook(() => useSuppressPasswordAutofill());

    result.current(container);

    expect(container.querySelector('input')?.getAttribute('autocomplete')).toBe('off');
  });

  it('should do nothing when the element it was attached to is being unmounted', () => {
    const { result } = renderHook(() => useSuppressPasswordAutofill());
    expect(() => result.current(null)).not.toThrow();
  });
});
