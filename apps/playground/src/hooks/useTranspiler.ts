import { useCallback, useState } from 'react';

import { useInterval } from '@douglasneuroinformatics/libui/hooks';

import type { EditorFile } from '@/models/editor-file.model';
import { useSettingsStore } from '@/store/settings.store';
import { hashFiles } from '@/utils/hash';

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
  const refreshInterval = useSettingsStore((store) => store.refreshInterval);
  const [filesHash, setFilesHash] = useState<string>('');
  const [state, setState] = useState<TranspilerState>({ status: 'initial' });
  const instrumentBundler = useInstrumentBundler();

  const transpile = useCallback(async (inputs: EditorFile[]) => {
    setState({ status: 'building' });
    let bundle: string;
    try {
      bundle = await instrumentBundler.bundle({ inputs });
      setState({ bundle, status: 'built' });
    } catch (err) {
      setState({ error: err instanceof Error ? err : new Error('Unexpected Error', { cause: err }), status: 'error' });
    } finally {
      setFilesHash(await hashFiles(inputs));
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
  }, refreshInterval);

  return state;
}
