import React from 'react';

import { Card } from '@douglasneuroinformatics/ui';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';

import type { TranspilerState } from '@/hooks/useTranspiler';

import { InstrumentViewer } from './InstrumentViewer';

export type DesktopEditorProps = {
  defaultValue: string;
  path: string;
  state: TranspilerState;
};

export const DesktopEditor = React.forwardRef<EditorPaneRef, DesktopEditorProps>(function DesktopEditor(
  { defaultValue, path, state },
  ref
) {
  return (
    <div className="flex h-full gap-8 p-2">
      <Card className="flex-grow overflow-hidden">
        <EditorPane className="h-full min-h-0" defaultValue={defaultValue} path={path} ref={ref} />
      </Card>
      <Card className="flex h-full min-h-0 w-[640px] flex-shrink-0 flex-col justify-center overflow-scroll p-4">
        <InstrumentViewer state={state} />
      </Card>
    </div>
  );
});
