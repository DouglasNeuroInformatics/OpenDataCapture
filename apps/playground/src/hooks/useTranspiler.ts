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
  message: string;
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
        setState({ message: err, status: 'error' });
      } else if (err instanceof ZodError) {
        const validationError = fromZodError(err, {
          prefix: 'Instrument Validation Failed'
        });
        setState({ message: validationError.message, status: 'error' });
      } else if (err instanceof Error) {
        setState({ message: err.message, status: 'error' });
      } else {
        setState({ message: 'Unknown Error', status: 'error' });
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
