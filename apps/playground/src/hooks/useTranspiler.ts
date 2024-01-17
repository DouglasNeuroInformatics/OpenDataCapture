import { useCallback, useEffect, useState } from 'react';

import { type AnyUnilingualInstrument } from '@open-data-capture/common/instrument';
import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';
import { BrowserInstrumentTransformer } from '@open-data-capture/instrument-transformer/browser';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

type BuiltState = {
  instrument: AnyUnilingualInstrument;
  status: 'built';
};

type ErrorState = {
  message: string;
  status: 'error';
};

type LoadingState = {
  status: 'loading';
};

const instrumentInterpreter = new InstrumentInterpreter();
const instrumentTransformer = new BrowserInstrumentTransformer();

export type TranspilerState = BuiltState | ErrorState | LoadingState;

export function useTranspiler() {
  const [state, setState] = useState<TranspilerState>({ status: 'loading' });
  const [source, setSource] = useState<null | string>(null);

  const transpile = useCallback(async (source: string) => {
    setState({ status: 'loading' });
    let instrument: AnyUnilingualInstrument;
    try {
      const bundle = await instrumentTransformer.generateBundle(source);
      const unknownInstrument = await instrumentInterpreter.interpret(bundle, { validate: false });
      if (unknownInstrument.kind === 'FORM') {
        instrument = translateFormInstrument(unknownInstrument, 'en');
      } else {
        instrument = unknownInstrument;
      }
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
    setState({ instrument, status: 'built' });
  }, []);

  useEffect(() => {
    if (!source) {
      return;
    }
    void transpile(source);
  }, [source]);

  return { setSource, setState, source, state };
}
