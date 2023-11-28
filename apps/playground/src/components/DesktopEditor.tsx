import React, { useContext } from 'react';

import { Card, Dropdown } from '@douglasneuroinformatics/ui';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';

import { EditorContext } from '@/context/EditorContext';

import { InstrumentViewer } from './InstrumentViewer';

export const DesktopEditor = React.forwardRef<EditorPaneRef>(function DesktopEditor(_, ref) {
  const ctx = useContext(EditorContext);

  return (
    <div className="flex h-full gap-8 p-2">
      <div className="flex flex-grow flex-col">
        <div className="my-2 flex items-center justify-between">
          <h5>Editor</h5>
          <div className="flex items-center">
            <span className="whitespace-nowrap">Selected Instrument: </span>
            <Dropdown
              options={ctx.exampleOptions}
              size="sm"
              title={ctx.selectedExample.label}
              variant="secondary"
              onSelection={ctx.onChangeSelection}
            />
          </div>
        </div>
        <Card className="flex-grow overflow-hidden">
          <EditorPane
            className="h-full min-h-0"
            defaultValue={ctx.selectedExample.value}
            path={ctx.selectedExample.path}
            ref={ref}
          />
        </Card>
      </div>
      <div className="flex h-full min-h-0 w-[640px] flex-shrink-0 flex-col">
        <div className="my-2">
          <h5>Editor</h5>
        </div>
        <Card className="flex h-full w-full flex-col justify-center overflow-scroll p-4">
          <InstrumentViewer state={ctx.state} />
        </Card>
      </div>
    </div>
  );
});
