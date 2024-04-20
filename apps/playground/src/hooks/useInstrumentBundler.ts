import { useMemo } from 'react';

import { InstrumentBundler } from '@opendatacapture/instrument-bundler';
import esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import { useEditorStore } from '@/store/editor.store';

await esbuild.initialize({
  wasmURL: esbuildWasmUrl
});

export function useInstrumentBundler() {
  return useMemo(() => {
    return new InstrumentBundler({
      resolve: (id) => {
        const editorStore = useEditorStore.getState();
        let filename: string;
        if (id.startsWith('./')) {
          filename = id.slice(2);
        } else {
          return null;
        }
        const file = editorStore.files.find((file) => file.name === filename);
        if (!file) {
          return null;
        } else if (file.language !== 'css') {
          throw new Error(`Unsupported language: ${file.language}`);
        }
        return `String.raw\`${file.value}\``;
      }
    });
  }, []);
}
