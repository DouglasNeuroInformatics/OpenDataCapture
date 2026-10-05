import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrument } from '../useInstrument';

import '@/services/i18n';

type BundleData = { bundle: string; id: string; kind: 'FORM' };

const mocks = vi.hoisted(() => {
  const bundleQuery: { data: BundleData | undefined } = { data: undefined };
  return { bundleQuery, interpreter: { interpret: vi.fn() } };
});

vi.mock('../useInstrumentBundle', () => ({
  useInstrumentBundle: () => mocks.bundleQuery
}));

vi.mock('../useInstrumentInterpreter', () => ({
  useInstrumentInterpreter: () => mocks.interpreter
}));

const BILINGUAL_BUNDLE: BundleData = { bundle: '__BILINGUAL__', id: 'bilingual-1', kind: 'FORM' };

describe('useInstrument', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    mocks.bundleQuery.data = BILINGUAL_BUNDLE;
    mocks.interpreter.interpret.mockResolvedValue(bilingualFormInstrument.instance);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('should provide no instrument while no bundle is loaded', () => {
    mocks.bundleQuery.data = undefined;
    const { result } = renderHook(() => useInstrument(null));
    expect(result.current).toBeNull();
    expect(mocks.interpreter.interpret).not.toHaveBeenCalled();
  });

  it('should translate the interpreted instrument into the interface language', async () => {
    i18n.changeLanguage('fr');
    const { result } = renderHook(() => useInstrument('bilingual-1'));
    await waitFor(() => expect(result.current?.details.title).toBe('Formulaire bilingue'));
  });

  it('should validate the bundle in development, so authoring mistakes surface early', async () => {
    vi.stubEnv('DEV', true);
    const { result } = renderHook(() => useInstrument('bilingual-1'));
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(mocks.interpreter.interpret).toHaveBeenCalledWith('__BILINGUAL__', { id: 'bilingual-1', validate: true });
  });

  it('should skip validating the bundle outside development, so a production page loads faster', async () => {
    vi.stubEnv('DEV', false);
    const { result } = renderHook(() => useInstrument('bilingual-1'));
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(mocks.interpreter.interpret).toHaveBeenCalledWith('__BILINGUAL__', { id: 'bilingual-1', validate: false });
  });

  it('should log a bundle that fails to interpret and provide no instrument', async () => {
    const error = new Error('Invalid bundle');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.interpreter.interpret.mockRejectedValue(error);
    const { result } = renderHook(() => useInstrument('bilingual-1'));
    await waitFor(() => expect(consoleError).toHaveBeenCalledWith(error));
    expect(result.current).toBeNull();
  });

  it('should replace the instrument when a different bundle loads', async () => {
    const { rerender, result } = renderHook(() => useInstrument('bilingual-1'));
    await waitFor(() => expect(result.current?.details.title).toBe('Bilingual Form'));
    mocks.interpreter.interpret.mockResolvedValue(unilingualFormInstrument.instance);
    mocks.bundleQuery.data = { bundle: '__UNILINGUAL__', id: 'unilingual-1', kind: 'FORM' };
    rerender();
    await waitFor(() => expect(result.current?.details.title).toBe('Unilingual Form'));
  });

  it('should clear the instrument when the bundle is deselected', async () => {
    const { rerender, result } = renderHook(() => useInstrument('bilingual-1'));
    await waitFor(() => expect(result.current).not.toBeNull());
    mocks.bundleQuery.data = undefined;
    rerender();
    expect(result.current).toBeNull();
  });
});
