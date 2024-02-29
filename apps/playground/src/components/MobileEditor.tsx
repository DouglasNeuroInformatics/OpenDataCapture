import React, { useContext, useState } from 'react';

import { Dropdown } from '@douglasneuroinformatics/ui/legacy';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/editor';
import { match } from 'ts-pattern';

import { EditorContext } from '@/context/EditorContext';

import { InstrumentViewer } from './InstrumentViewer';
import { Tabs } from './Tabs';

export const MobileEditor = React.forwardRef<EditorPaneRef>(function MobileEditor(_, ref) {
  const [activeTab, setActiveTab] = useState<'Editor' | 'Instrument'>('Editor');
  const ctx = useContext(EditorContext);

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-screen-lg flex-col space-y-2 p-2">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={[{ name: 'Editor' }, { name: 'Instrument' }]} />
      <Dropdown
        options={ctx.exampleOptions}
        size="sm"
        title={ctx.selectedExample.label}
        variant="secondary"
        onSelection={ctx.onChangeSelection}
      />
      <div className="flex h-full flex-col">
        {match(activeTab)
          .with('Editor', () => (
            <EditorPane
              className="min-h-0"
              defaultValue={ctx.selectedExample.value}
              path={ctx.selectedExample.path}
              ref={ref}
            />
          ))
          .with('Instrument', () => <InstrumentViewer state={ctx.state} />)
          .exhaustive()}
      </div>
    </div>
  );
});
