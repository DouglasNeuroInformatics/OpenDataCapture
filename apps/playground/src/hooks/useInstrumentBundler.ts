import { useMemo } from 'react';

import { InstrumentBundler } from '@opendatacapture/instrument-bundler';
import esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

await esbuild.initialize({
  wasmURL: esbuildWasmUrl
});

export function useInstrumentBundler() {
  return useMemo(() => new InstrumentBundler(), []);
}
