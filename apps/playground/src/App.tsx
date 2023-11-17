import { useMemo, useRef, useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { useInterval } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { BrowserInstrumentTransformer } from '@open-data-capture/instrument-transformer/browser';
import happinessQuestionnaire from '@open-data-capture/instruments/forms/happiness-questionnaire?raw';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';
import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
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
    <div className="grid h-screen grid-cols-2 p-6">
      <div className="col-span-1 overflow-hidden border border-slate-900/10 dark:border-slate-100/25">
        <EditorPane defaultValue={happinessQuestionnaire} path="happiness-questionnaire.ts" ref={ref} />
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
    </div>
  );
};
