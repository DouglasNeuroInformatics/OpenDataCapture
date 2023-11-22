import { useRef } from 'react';

import { useInterval, useMediaQuery } from '@douglasneuroinformatics/ui';
import { type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';

import { useTranspiler } from '@/hooks/useTranspiler';

import developerHappinessQuestionnaire from '../examples/developer-happiness.instrument?raw';
import { DesktopEditor } from './DesktopEditor';
import { MobileEditor } from './MobileEditor';

export const Editor = () => {
  const { setSource, state } = useTranspiler();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const ref = useRef<EditorPaneRef>(null);

  useInterval(() => {
    setSource(ref.current?.editor?.getValue() ?? null);
  }, 2000);

  return (
    <div className="mx-auto flex h-screen max-w-screen-2xl flex-col">
      <header className="my-6 lg:my-8">
        <h1 className="text-center text-xl font-semibold">Instrument Playground</h1>
      </header>
      <main className="h-full min-h-0">
        {isDesktop ? (
          <DesktopEditor
            defaultValue={developerHappinessQuestionnaire}
            path="happiness-questionnaire.ts"
            ref={ref}
            state={state}
          />
        ) : (
          <MobileEditor
            defaultValue={developerHappinessQuestionnaire}
            path="happiness-questionnaire.ts"
            ref={ref}
            state={state}
          />
        )}
      </main>
    </div>
  );
};
