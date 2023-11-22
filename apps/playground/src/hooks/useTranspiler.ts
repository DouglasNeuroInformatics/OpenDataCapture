import { useCallback, useEffect, useState } from 'react';

import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { BrowserInstrumentTransformer } from '@open-data-capture/instrument-transformer/browser';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

type BuiltState = {
  form: FormInstrument<FormDataType, Language>;
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
    let form: FormInstrument<FormDataType, Language>;
    try {
      const bundle = instrumentTransformer.generateBundleSync(source);
      const instrument = evaluateInstrument<FormInstrument>(bundle, { validate: false });
      form = translateFormInstrument(instrument, 'en');
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
    setState({ form, status: 'built' });
  }, []);

  useEffect(() => {
    if (!source) {
      return;
    }
    transpile(source);
  }, [source]);

  return { setSource, setState, source, state };
}
