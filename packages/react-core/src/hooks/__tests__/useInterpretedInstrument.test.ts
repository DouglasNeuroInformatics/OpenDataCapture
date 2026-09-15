import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { useInterpretedInstrument } from '../useInterpretedInstrument';

/**
 * A bundle is an async IIFE resolving to the instrument. Interpretation does not validate unless
 * asked to, so the minimum an instrument needs here is a kind and a unilingual language.
 */
function createBundle({ delay = 0, title }: { delay?: number; title: string }) {
  return `(async () => {
    await new Promise((resolve) => setTimeout(resolve, ${delay}));
    return {
      __runtimeVersion: 1,
      kind: 'FORM',
      language: 'en',
      content: {},
      details: { title: '${title}' }
    };
  })()`;
}

describe('useInterpretedInstrument', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  it('should report LOADING until the bundle has been interpreted', () => {
    const { result } = renderHook(() => useInterpretedInstrument(createBundle({ title: 'First' })));
    expect(result.current.status).toBe('LOADING');
  });

  it('should report the interpreted instrument once it resolves', async () => {
    const { result } = renderHook(() => useInterpretedInstrument(createBundle({ title: 'First' })));
    await waitFor(() => {
      expect(result.current).toMatchObject({ instrument: { details: { title: 'First' } }, status: 'DONE' });
    });
  });

  it('should return to LOADING when the bundle changes, so a caller cannot keep rendering the previous instrument', async () => {
    const { rerender, result } = renderHook(({ bundle }) => useInterpretedInstrument(bundle), {
      initialProps: { bundle: createBundle({ title: 'First' }) }
    });
    await waitFor(() => {
      expect(result.current.status).toBe('DONE');
    });

    rerender({ bundle: createBundle({ title: 'Second' }) });
    expect(result.current.status).toBe('LOADING');

    await waitFor(() => {
      expect(result.current).toMatchObject({ instrument: { details: { title: 'Second' } }, status: 'DONE' });
    });
  });

  it('should ignore a bundle that resolves after another has replaced it', async () => {
    const { rerender, result } = renderHook(({ bundle }) => useInterpretedInstrument(bundle), {
      initialProps: { bundle: createBundle({ delay: 50, title: 'Slow' }) }
    });
    rerender({ bundle: createBundle({ title: 'Fast' }) });

    await waitFor(() => {
      expect(result.current).toMatchObject({ instrument: { details: { title: 'Fast' } }, status: 'DONE' });
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(result.current).toMatchObject({ instrument: { details: { title: 'Fast' } }, status: 'DONE' });
  });

  it('should recover from a bundle that fails to interpret, rather than reporting its error for the next one', async () => {
    const { rerender, result } = renderHook(({ bundle }) => useInterpretedInstrument(bundle), {
      initialProps: { bundle: '(async () => { throw new Error("Failed to evaluate"); })()' }
    });
    await waitFor(() => {
      expect(result.current.status).toBe('ERROR');
    });

    rerender({ bundle: createBundle({ title: 'Recovered' }) });
    expect(result.current.status).toBe('LOADING');

    await waitFor(() => {
      expect(result.current).toMatchObject({ instrument: { details: { title: 'Recovered' } }, status: 'DONE' });
    });
  });

  it('should wrap a non-Error thrown while interpreting, rather than fail to report an error at all', async () => {
    const { result } = renderHook(() => useInterpretedInstrument('(async () => { throw "not an Error instance"; })()'));
    await waitFor(() => {
      expect(result.current.status).toBe('ERROR');
    });
    expect((result.current as { error: Error }).error).toBeInstanceOf(Error);
  });

  it('should report every language of a multilingual instrument as supported', async () => {
    const bundle = `(async () => ({
      __runtimeVersion: 1,
      kind: 'FORM',
      language: ['en', 'fr'],
      content: {},
      details: {
        description: { en: 'English description', fr: 'Description française' },
        title: { en: 'English Title', fr: 'Titre français' }
      },
      tags: { en: [], fr: [] }
    }))()`;
    const { result } = renderHook(() => useInterpretedInstrument(bundle));
    await waitFor(() => {
      expect(result.current.status).toBe('DONE');
    });
    expect((result.current as { instrument: { supportedLanguages: string[] } }).instrument.supportedLanguages).toEqual([
      'en',
      'fr'
    ]);
  });
});
