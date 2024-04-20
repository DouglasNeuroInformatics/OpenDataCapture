import { useCallback, useState } from 'react';

import { useInterval } from '@douglasneuroinformatics/libui/hooks';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import type { EditorFile } from '@/models/editor-file.model';
import { useSettingsStore } from '@/store/settings.store';
import { hashFiles } from '@/utils/hash';
import { resolveIndexFile } from '@/utils/resolve';

import { useEditorFilesRef } from './useEditorFilesRef';
import { useInstrumentBundler } from './useInstrumentBundler';

type InitialState = {
  status: 'initial';
};

type BuiltState = {
  bundle: string;
  status: 'built';
};

type ErrorState = {
  error: Error;
  status: 'error';
};

type BuildingState = {
  status: 'building';
};

type TranspilerState = BuildingState | BuiltState | ErrorState | InitialState;

export function useTranspiler(): TranspilerState {
  const editorFilesRef = useEditorFilesRef();
  const rebuildInterval = useSettingsStore((store) => store.rebuildInterval);
  const [filesHash, setFilesHash] = useState<string>('');
  const [state, setState] = useState<TranspilerState>({ status: 'initial' });
  const instrumentBundler = useInstrumentBundler();

  const transpile = useCallback(async (files: EditorFile[]) => {
    const source = resolveIndexFile(files).value;
    setState({ status: 'building' });
    let bundle: string;
    try {
      bundle = await instrumentBundler.generateBundle({ source });
      setState({ bundle, status: 'built' });
    } catch (err) {
      console.error(err);
      let transpilerError: Error;
      if (typeof err === 'string') {
        transpilerError = new Error(err, { cause: err });
      } else if (err instanceof ZodError) {
        const validationError = fromZodError(err, {
          prefix: 'Instrument Validation Failed'
        });
        transpilerError = new Error(validationError.message, { cause: err });
      } else if (err instanceof Error) {
        transpilerError = new Error(err.message, { cause: err });
      } else {
        transpilerError = new Error('Unknown Error', { cause: err });
      }
      setState({ error: transpilerError, status: 'error' });
    } finally {
      setFilesHash(await hashFiles(files));
    }
  }, []);

  useInterval(() => {
    const currentFiles = editorFilesRef.current;
    hashFiles(currentFiles)
      .then((currentHash) => {
        if (currentHash !== filesHash) {
          void transpile(currentFiles);
        }
      })
      .catch(console.error);
  }, rebuildInterval);

  return state;
}
