import { useCallback, useEffect, useState } from 'react';

import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

type BuiltState = {
  bundle: string;
  status: 'built';
};

type ErrorState = {
  error: Error;
  status: 'error';
};

type LoadingState = {
  status: 'loading';
};

const instrumentTransformer = new InstrumentTransformer();
await instrumentTransformer.init({ wasmURL: esbuildWasmUrl });

export type TranspilerState = BuiltState | ErrorState | LoadingState;

export function useTranspiler() {
  const [state, setState] = useState<TranspilerState>({ status: 'loading' });
  const [source, setSource] = useState<null | string>(null);

  const transpile = useCallback(async (source: string) => {
    setState({ status: 'loading' });
    let bundle: string;
    try {
      bundle = await instrumentTransformer.generateBundle(source);
    } catch (err) {
      console.error(err);
      if (typeof err === 'string') {
        setState({ error: new Error(err, { cause: err }), status: 'error' });
      } else if (err instanceof ZodError) {
        const validationError = fromZodError(err, {
          prefix: 'Instrument Validation Failed'
        });
        setState({ error: new Error(validationError.message, { cause: err }), status: 'error' });
      } else if (err instanceof Error) {
        setState({ error: new Error(err.message, { cause: err }), status: 'error' });
      } else {
        setState({ error: new Error('Unknown Error', { cause: err }), status: 'error' });
      }
      return;
    }
    setState({ bundle, status: 'built' });
  }, []);

  useEffect(() => {
    if (!source) {
      return;
    }
    void transpile(source);
  }, [source]);

  return { setSource, setState, source, state };
}
