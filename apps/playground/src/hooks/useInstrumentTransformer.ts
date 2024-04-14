import { useMemo } from 'react';

import { InstrumentTransformer } from '@opendatacapture/instrument-transformer/browser';
import esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

await esbuild.initialize({
  wasmURL: esbuildWasmUrl
});

export function useInstrumentTransformer() {
  return useMemo(() => new InstrumentTransformer(), []);
}
