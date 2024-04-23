import { useMemo } from 'react';

import { InstrumentBundler } from '@opendatacapture/instrument-bundler';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

const { initialize } = await import('esbuild-wasm');
await initialize({
  wasmURL: esbuildWasmUrl
});

export function useInstrumentBundler() {
  return useMemo(() => new InstrumentBundler(), []);
}
