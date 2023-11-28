import React, { useContext } from 'react';

import {
  Card,
  DownloadButton,
  Dropdown,
  ThemeToggle,
  useDownload,
  useNotificationsStore
} from '@douglasneuroinformatics/ui';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';

import { EditorContext } from '@/context/EditorContext';

import { InstrumentViewer } from './InstrumentViewer';

const sourceBanner = `/**
 * Please note that if you open this instrument in your IDE without the appropriate global type declarations,
 * you will see errors. This is expected so do not panic!
 */
`;

export const DesktopEditor = React.forwardRef<EditorPaneRef>(function DesktopEditor(_, ref) {
  const ctx = useContext(EditorContext);
  const download = useDownload();
  const notifications = useNotificationsStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between">
        <div className="flex w-min items-center gap-2">
          <span className="whitespace-nowrap">Selected Instrument: </span>
          <Dropdown
            options={ctx.exampleOptions}
            size="sm"
            title={ctx.selectedExample.label}
            variant="secondary"
            onSelection={ctx.onChangeSelection}
          />
        </div>
        <div className="flex items-center gap-2">
          <DownloadButton
            onClick={() => {
              if (ctx.state.status !== 'built') {
                notifications.addNotification({
                  message: `Cannot download instrument when transpilation status is '${ctx.state.status}'`,
                  type: 'error'
                });
                return;
              } else if (ctx.source === null) {
                notifications.addNotification({
                  message: `Cannot download instrument when source is null'`,
                  type: 'error'
                });
                return;
              }
              const source = sourceBanner.concat(ctx.source);
              void download('instrument.tsx', () => source);
            }}
          />
          <ThemeToggle />
        </div>
      </div>
      <div className="flex h-full gap-8 p-2">
        <div className="flex flex-grow flex-col">
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
          <Card className="flex h-full w-full flex-col justify-center overflow-scroll p-4">
            <InstrumentViewer state={ctx.state} />
          </Card>
        </div>
      </div>
    </div>
  );
});
