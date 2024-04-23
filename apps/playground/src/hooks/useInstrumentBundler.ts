import { useMemo } from 'react';

import { InstrumentBundler } from '@opendatacapture/instrument-bundler';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import { useEditorStore } from '@/store/editor.store';
import { inferFileLanguage } from '@/utils/file';

const { initialize } = await import('esbuild-wasm');
await initialize({
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
        }
        const language = inferFileLanguage(file?.name);
        if (language !== 'css') {
          throw new Error(`Unsupported language: ${language}`);
        }
        return `String.raw\`${file.value}\``;
      }
    });
  }, []);
}
