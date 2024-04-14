import { useCallback, useState } from 'react';

import { useInterval } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentTransformer } from '@opendatacapture/instrument-transformer/browser';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { useSourceRef } from './useSourceRef';

const DEFAULT_REBUILD_INTERVAL = 2000;

type InitialState = {
  source: null;
  status: 'initial';
};

type BuiltState = {
  bundle: string;
  source: string;
  status: 'built';
};

type ErrorState = {
  error: Error;
  source: string;
  status: 'error';
};

type BuildingState = {
  status: 'building';
};

type TranspilerState = BuildingState | BuiltState | ErrorState | InitialState;

const instrumentTransformer = new InstrumentTransformer();
await instrumentTransformer.init({ wasmURL: esbuildWasmUrl });

export function useTranspiler() {
  const sourceRef = useSourceRef();
  const [state, setState] = useState<TranspilerState>({ source: null, status: 'initial' });

  const transpile = useCallback(async (source: string) => {
    setState({ status: 'building' });
    let bundle: string;
    try {
      bundle = await instrumentTransformer.generateBundle(source);
      setState({ bundle, source, status: 'built' });
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
      setState({ error: transpilerError, source, status: 'error' });
    }
  }, []);

  useInterval(() => {
    const currentSource = sourceRef.current;
    if (state.status === 'building' || state.source === currentSource) {
      return;
    }
    void transpile(currentSource);
  }, DEFAULT_REBUILD_INTERVAL);

  return state;
}
