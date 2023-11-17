import { useEffect, useMemo, useRef, useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { Language } from '@open-data-capture/common/core';
import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import happinessQuestionnaire from '@open-data-capture/instruments/forms/happiness-questionnaire?raw';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';
import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
import initSwc, { transformSync } from '@swc/wasm-web';

export const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [form, setForm] = useState<FormInstrument<FormDataType, Language> | null>(null);
  const [source, setSource] = useState<null | string>(null);
  const ref = useRef<EditorPaneRef>(null);

  useEffect(() => {
    void initSwc()
      .then(() => {
        setIsInitialized(true);
      })
      .catch((err) => {
        console.error('Failed to Initialize SWC', err);
      });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const value = ref.current?.editor?.getValue();
      if (!value) {
        setSource(null);
        return;
      }
      setSource(value);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const bundle = useMemo(() => {
    if (!(isInitialized && source)) {
      return null;
    }
    const result = transformSync(source, {
      jsc: {
        parser: {
          syntax: 'typescript'
        }
      }
    });
    let output = result.code;
    output = output.replace('export default', 'const __instrument__ =');
    output = `(({ z }) => {
        ${output}
        return __instrument__
      })`;
    return output;
  }, [source]);

  useEffect(() => {
    if (bundle) {
      const instrument = evaluateInstrument<FormInstrument>(bundle);
      setForm(translateFormInstrument(instrument, 'en'));
    }
  }, [bundle]);

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
