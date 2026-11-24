import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, renderHook } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { useInstrumentLanguage } from '../useInstrumentLanguage';

describe('useInstrumentLanguage', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
  });

  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('should follow the interface language when none is asked for', () => {
    const { result } = renderHook(() => useInstrumentLanguage());
    expect(result.current.contentLanguage).toBe('en');
  });

  it('should change the interface language when none is asked for, as instruments always have', () => {
    const { result } = renderHook(() => useInstrumentLanguage());
    act(() => result.current.changeContentLanguage('fr'));
    expect(i18n.resolvedLanguage).toBe('fr');
  });

  it('should use the language asked for, whatever the interface language', () => {
    const { result } = renderHook(() => useInstrumentLanguage('fr'));
    expect(result.current.contentLanguage).toBe('fr');
  });

  it('should change only the content language when one was asked for, leaving the interface alone', () => {
    const { result } = renderHook(() => useInstrumentLanguage('fr'));
    act(() => result.current.changeContentLanguage('en'));
    expect(result.current.contentLanguage).toBe('en');
    expect(i18n.resolvedLanguage).toBe('en');
    act(() => result.current.changeContentLanguage('es'));
    expect(result.current.contentLanguage).toBe('es');
    expect(i18n.resolvedLanguage).toBe('en');
  });

  it('should take up a newly requested language, so a renderer kept mounted drops the previous one', () => {
    const { rerender, result } = renderHook((language?: 'en' | 'fr') => useInstrumentLanguage(language), {
      initialProps: 'fr' as 'en' | 'fr' | undefined
    });
    expect(result.current.contentLanguage).toBe('fr');
    rerender('en');
    expect(result.current.contentLanguage).toBe('en');
  });

  it('should keep a held language when the interface language changes, so a locked instrument stays in it', () => {
    const { result } = renderHook(() => useInstrumentLanguage());
    act(() => result.current.holdContentLanguage('en'));
    act(() => i18n.changeLanguage('fr'));
    expect(result.current.contentLanguage).toBe('en');
  });

  it('should follow the interface language again once nothing is requested', () => {
    const { rerender, result } = renderHook((language?: 'en' | 'fr') => useInstrumentLanguage(language), {
      initialProps: 'fr' as 'en' | 'fr' | undefined
    });
    rerender(undefined);
    act(() => result.current.changeContentLanguage('es'));
    expect(i18n.resolvedLanguage).toBe('es');
  });
});
