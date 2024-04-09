import React, { useContext, useState } from 'react';

import { Select } from '@douglasneuroinformatics/libui/components';
import { EditorPane, type EditorPaneRef } from '@opendatacapture/editor';
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
      <Select value={ctx.selectedExample.label} onValueChange={ctx.onChangeSelection}>
        <Select.Trigger className="w-[180px]">
          <Select.Value placeholder="Select an Instrument" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Instruments</Select.Label>
            {ctx.exampleOptions.map((option) => {
              return (
                <Select.Item key={option} value={option}>
                  {option}
                </Select.Item>
              );
            })}
          </Select.Group>
        </Select.Content>
      </Select>
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
