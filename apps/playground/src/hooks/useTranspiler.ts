import { useCallback, useState } from 'react';

import { useInterval } from '@douglasneuroinformatics/libui/hooks';
import { sha256 } from '@opendatacapture/crypto';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';

import type { EditorFile } from '@/models/editor-file.model';
import { useAppStore } from '@/store';
import { editorFileToInput } from '@/utils/file';

import { useFilesRef } from './useFilesRef';
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

async function hashFiles(files: EditorFile[]) {
  return sha256(files.map((file) => file.content + file.name).join());
}

export function useTranspiler(): TranspilerState {
  const editorFilesRef = useFilesRef();
  const refreshInterval = useAppStore((store) => store.settings.refreshInterval);
  const [filesHash, setFilesHash] = useState<string>('');
  const [state, setState] = useState<TranspilerState>({ status: 'initial' });
  const instrumentBundler = useInstrumentBundler();

  const transpile = useCallback(async (files: EditorFile[]) => {
    setState({ status: 'building' });
    const inputs: BundlerInput[] = files.map(editorFileToInput);
    let bundle: string;
    try {
      bundle = await instrumentBundler.bundle({ inputs });
      setState({ bundle, status: 'built' });
    } catch (err) {
      setState({ error: err instanceof Error ? err : new Error('Unexpected Error', { cause: err }), status: 'error' });
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
  }, refreshInterval);

  return state;
}
