import React, { useState } from 'react';

import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';
import { match } from 'ts-pattern';

import type { TranspilerState } from '@/hooks/useTranspiler';

import { InstrumentViewer } from './InstrumentViewer';
import { Tabs } from './Tabs';

export type MobileEditorProps = {
  defaultValue: string;
  path: string;
  state: TranspilerState;
};

export const MobileEditor = React.forwardRef<EditorPaneRef, MobileEditorProps>(function MobileEditor(
  { defaultValue, path, state },
  ref
) {
  const [activeTab, setActiveTab] = useState<'Editor' | 'Instrument'>('Editor');
  return (
    <div className="mx-auto flex h-full min-h-0 max-w-screen-lg flex-col space-y-2 p-2">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={[{ name: 'Editor' }, { name: 'Instrument' }]} />
      <div className="flex h-full flex-col">
        {match(activeTab)
          .with('Editor', () => <EditorPane className="min-h-0" defaultValue={defaultValue} path={path} ref={ref} />)
          .with('Instrument', () => <InstrumentViewer state={state} />)
          .exhaustive()}
      </div>
    </div>
  );
});
