import React, { useMemo } from 'react';

import { Card, Dropdown } from '@douglasneuroinformatics/ui';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';

import { type ExampleInstrumentData, examples } from '@/examples';
import type { TranspilerState } from '@/hooks/useTranspiler';

import { InstrumentViewer } from './InstrumentViewer';

export type DesktopEditorProps = {
  onChangeSelection: (label: string) => void;
  selectedExample: ExampleInstrumentData;
  state: TranspilerState;
};

export const DesktopEditor = React.forwardRef<EditorPaneRef, DesktopEditorProps>(function DesktopEditor(
  { onChangeSelection, selectedExample, state },
  ref
) {
  const options = useMemo(() => {
    return examples.map((instrument) => instrument.label).sort();
  }, [examples]);

  return (
    <div className="flex h-full gap-8 p-2">
      <div className="flex flex-grow flex-col">
        <div className="my-2 flex items-center justify-between">
          <h5>Editor</h5>
          <div className="flex items-center">
            <span className="whitespace-nowrap">Selected Instrument: </span>
            <Dropdown
              options={options}
              size="sm"
              title={selectedExample.label}
              variant="secondary"
              onSelection={onChangeSelection}
            />
          </div>
        </div>
        <Card className="flex-grow overflow-hidden">
          <EditorPane
            className="h-full min-h-0"
            defaultValue={selectedExample.value}
            path={selectedExample.path}
            ref={ref}
          />
        </Card>
      </div>
      <div className="flex h-full min-h-0 w-[640px] flex-shrink-0 flex-col">
        <div className="my-2">
          <h5>Editor</h5>
        </div>
        <Card className="flex h-full w-full flex-col justify-center overflow-scroll p-4">
          <InstrumentViewer state={state} />
        </Card>
      </div>
    </div>
  );
});
