import { useEffect, useRef, useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Card, Spinner, useInterval } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { BrowserInstrumentTransformer } from '@open-data-capture/instrument-transformer/browser';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';
import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
import { match } from 'ts-pattern';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import developerHappinessQuestionnaire from '../examples/developer-happiness.instrument?raw';
// import { Tabs } from './Tabs';

const instrumentTransformer = new BrowserInstrumentTransformer();

type EditorBuiltState = {
  form: FormInstrument<FormDataType, Language>;
  status: 'built';
};

type EditorErrorState = {
  message: string;
  status: 'error';
};

type EditorLoadingState = {
  status: 'loading';
};

type EditorState = EditorBuiltState | EditorErrorState | EditorLoadingState;

export const Editor = () => {
  const [state, setState] = useState<EditorState>({ status: 'loading' });
  const [source, setSource] = useState<null | string>(null);
  const ref = useRef<EditorPaneRef>(null);

  useInterval(() => {
    setSource(ref.current?.editor?.getValue() ?? null);
  }, 2000);

  useEffect(() => {
    if (!source) {
      return;
    }
    setState({ status: 'loading' });
    let form: FormInstrument<FormDataType, Language>;
    try {
      const bundle = instrumentTransformer.generateBundleSync(source);
      const instrument = evaluateInstrument<FormInstrument>(bundle, { validate: true });
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
  }, [source]);

  return (
    <div className="mx-auto flex h-screen max-w-screen-2xl flex-col p-4 lg:p-8">
      <header className="mb-8">
        <h1 className="text-center text-xl font-semibold">Instrument Playground</h1>
      </header>
      <main className="grid h-[calc(100vh-128px)] gap-16 lg:grid-cols-2">
        {/* <Tabs
          tabs={[
            { current: true, label: 'Editor' },
            { current: false, label: 'Instrument' }
          ]}
        /> */}
        <div className="col-span-1 h-full overflow-hidden rounded-md border border-slate-900/10 dark:border-slate-100/25">
          <EditorPane defaultValue={developerHappinessQuestionnaire} path="happiness-questionnaire.ts" ref={ref} />
        </div>
        <div className="col-span-1 h-full overflow-hidden">
          {match(state)
            .with({ status: 'built' }, ({ form }) => (
              <FormStepper
                form={form}
                onSubmit={(data) => {
                  // eslint-disable-next-line no-alert
                  alert(JSON.stringify(data));
                }}
              />
            ))
            .with({ status: 'error' }, ({ message }) => (
              <div className="flex h-full flex-col items-center justify-center">
                <h3 className="mb-3 text-center font-semibold">Failed to Compile</h3>
                <Card className="flex-grow overflow-scroll">
                  <code className="text-sm">{message}</code>
                </Card>
              </div>
            ))
            .with({ status: 'loading' }, () => <Spinner />)
            .exhaustive()}
        </div>
      </main>
    </div>
  );
};
