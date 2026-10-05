import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { InstrumentInterpreter } from '@opendatacapture/instrument-interpreter';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

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

  it('should ignore a failure from a bundle that another has replaced, rather than reporting its error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failingBundle =
      '(async () => { await new Promise((r) => setTimeout(r, 50)); throw new Error("Too late"); })()';
    const { rerender, result } = renderHook(({ bundle }) => useInterpretedInstrument(bundle), {
      initialProps: { bundle: failingBundle }
    });
    rerender({ bundle: createBundle({ title: 'Fast' }) });

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(result.current).toMatchObject({ instrument: { details: { title: 'Fast' } }, status: 'DONE' });
    errorSpy.mockRestore();
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
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    // The interpreter already wraps whatever a bundle throws, so the rejection is injected beneath it.
    vi.spyOn(InstrumentInterpreter.prototype, 'interpret').mockRejectedValueOnce('not an Error instance');
    const { result } = renderHook(() => useInterpretedInstrument(createBundle({ title: 'First' })));
    await waitFor(() => {
      expect(result.current.status).toBe('ERROR');
    });
    expect(result.current).toMatchObject({ error: { cause: 'not an Error instance' } });
    vi.restoreAllMocks();
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
