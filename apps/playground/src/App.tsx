import { useMemo, useRef, useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { useInterval } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { BrowserInstrumentTransformer } from '@open-data-capture/instrument-transformer/browser';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';
import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';

import developerHappinessQuestionnaire from './examples/developer-happiness.instrument?raw';

const instrumentTransformer = new BrowserInstrumentTransformer();

export const App = () => {
  const [source, setSource] = useState<null | string>(null);
  const ref = useRef<EditorPaneRef>(null);

  useInterval(() => {
    setSource(ref.current?.editor?.getValue() ?? null);
  }, 2000);

  const form: FormInstrument<FormDataType, Language> | null = useMemo(() => {
    if (!source) {
      return null;
    }
    try {
      const bundle = instrumentTransformer.generateBundleSync(source);
      const instrument = evaluateInstrument<FormInstrument>(bundle);
      return translateFormInstrument(instrument, 'en');
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [source]);

  return (
    <div className="mx-auto flex h-screen max-w-screen-2xl flex-col p-8">
      <header className="mb-8">
        <h1 className="text-center text-xl font-semibold">Instrument Playground</h1>
      </header>
      <main className="grid h-[calc(100vh-128px)] grid-cols-2 gap-16">
        <div className="col-span-1 h-full overflow-hidden rounded-md border border-slate-900/10 dark:border-slate-100/25">
          <EditorPane defaultValue={developerHappinessQuestionnaire} path="happiness-questionnaire.ts" ref={ref} />
        </div>
        <div className="col-span-1">
          {form && (
            <FormStepper
              form={form}
              onSubmit={(data) => {
                // eslint-disable-next-line no-alert
                alert(JSON.stringify(data));
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};
