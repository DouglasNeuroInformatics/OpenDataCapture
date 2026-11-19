import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAdministrationChoice } from '../useAdministrationChoice';

import '@/services/i18n';

const instrument = (id: string, supportedLanguages: string[] = ['en', 'fr']) => {
  return {
    details: { title: 'Scale' },
    id,
    internal: { edition: 1, name: id },
    kind: 'FORM',
    supportedLanguages
  } as unknown as TranslatedInstrumentInfo;
};

const scale = instrument('scale');

describe('useAdministrationChoice', () => {
  it('should have no choice until an instrument is picked', () => {
    const { result } = renderHook(() => useAdministrationChoice());
    expect(result.current.choice).toBeNull();
  });

  it('should start a pick at the interface language', () => {
    const { result } = renderHook(() => useAdministrationChoice());
    let picked: ReturnType<typeof result.current.pick> | undefined;
    act(() => {
      picked = result.current.pick(scale);
    });
    expect(picked).toMatchObject({ instrument: { id: 'scale' }, language: 'en' });
    expect(result.current.choice).toMatchObject({ instrument: { id: 'scale' }, language: 'en' });
  });

  it('should keep the language the user chose', () => {
    const { result } = renderHook(() => useAdministrationChoice());
    act(() => {
      result.current.pick(scale);
    });
    act(() => {
      result.current.setLanguage('fr');
    });
    expect(result.current.choice?.language).toBe('fr');
  });

  it('should reset the language to the interface language on the next pick', () => {
    const { result } = renderHook(() => useAdministrationChoice());
    act(() => {
      result.current.pick(scale);
      result.current.setLanguage('fr');
    });
    act(() => {
      result.current.pick(instrument('other'));
    });
    expect(result.current.choice?.language).toBe('en');
  });

  it('should offer only the allowed languages, so a language the instance turned off is never used', () => {
    const { result } = renderHook(() => useAdministrationChoice(['fr']));
    act(() => {
      result.current.pick(scale);
    });
    expect(result.current.choice).toMatchObject({ language: 'fr', languageOptions: ['fr'] });
  });
});
