import { useRef } from 'react';

import { Card, Spinner, useInterval } from '@douglasneuroinformatics/ui';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';
import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
import { match } from 'ts-pattern';

import { useTranspiler } from '@/hooks/useTranspiler';

import developerHappinessQuestionnaire from '../examples/developer-happiness.instrument?raw';
// import { Tabs } from './Tabs';

export const Editor = () => {
  const { setSource, state } = useTranspiler();
  const ref = useRef<EditorPaneRef>(null);

  useInterval(() => {
    setSource(ref.current?.editor?.getValue() ?? null);
  }, 2000);

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
