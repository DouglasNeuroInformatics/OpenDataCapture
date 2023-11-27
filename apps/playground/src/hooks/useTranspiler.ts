import { useCallback, useEffect, useState } from 'react';

import { type FormInstrument } from '@open-data-capture/common/instrument';
import { evaluateInstrument } from '@open-data-capture/instrument-runtime';
import { BrowserInstrumentTransformer } from '@open-data-capture/instrument-transformer/browser';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

type BuiltState = {
  instrument: FormInstrument<FormDataType, Language> | InteractiveInstrument;
  status: 'built';
};

type ErrorState = {
  message: string;
  status: 'error';
};

type LoadingState = {
  status: 'loading';
};

const instrumentTransformer = new BrowserInstrumentTransformer();

export type TranspilerState = BuiltState | ErrorState | LoadingState;

export function useTranspiler() {
  const [state, setState] = useState<TranspilerState>({ status: 'loading' });
  const [source, setSource] = useState<null | string>(null);

  const transpile = useCallback((source: string) => {
    setState({ status: 'loading' });
    let instrument: FormInstrument<FormDataType, Language> | InteractiveInstrument;
    try {
      const bundle = instrumentTransformer.generateBundleSync(source);
      const unknownInstrument = evaluateInstrument(bundle, { validate: false });
      if (unknownInstrument.kind === 'form') {
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
    transpile(source);
  }, [source]);

  return { setSource, setState, source, state };
}
