import React, { useContext, useRef } from 'react';

import { Button, Card, LanguageToggle, Select, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { EditorPane, type EditorPaneRef } from '@opendatacapture/editor';
import { DownloadIcon, RefreshCwIcon } from 'lucide-react';

import { EditorContext } from '@/context/EditorContext';

import { InstrumentViewer, type InstrumentViewerRef } from './InstrumentViewer';

const sourceBanner = `/**
 * Please note that if you open this instrument in your IDE without the appropriate global type declarations,
 * you will see errors. This is expected so do not panic!
 */
`;

export const DesktopEditor = React.forwardRef<EditorPaneRef>(function DesktopEditor(_, ref) {
  const ctx = useContext(EditorContext);
  const download = useDownload();
  const notifications = useNotificationsStore();
  const viewerRef = useRef<InstrumentViewerRef>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between p-2">
        <div className="flex w-min items-center gap-2">
          <Select value={ctx.selectedExample.label} onValueChange={ctx.onChangeSelection}>
            <Select.Trigger className="min-w-72 gap-2">
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
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            type="button"
            variant="outline"
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
          >
            <DownloadIcon />
          </Button>
          <ThemeToggle />
          <Button
            size="icon"
            type="button"
            variant="outline"
            onClick={() => {
              viewerRef.current?.forceRefresh();
            }}
          >
            <RefreshCwIcon />
          </Button>
          <LanguageToggle
            align="end"
            options={{
              en: 'English',
              fr: 'Français'
            }}
          />
        </div>
      </div>
      <div className="flex h-full min-h-0 gap-8 p-2">
        <div className="flex flex-grow flex-col">
          <Card className="flex-grow p-0.5">
            <EditorPane
              className="h-full min-h-0"
              defaultValue={ctx.selectedExample.value}
              path={ctx.selectedExample.path}
              ref={ref}
            />
          </Card>
        </div>
        <div className="flex h-full min-h-0 w-[640px] flex-shrink-0 flex-col">
          <Card className="z-10 flex h-full w-full flex-col justify-center p-4">
            <InstrumentViewer ref={viewerRef} state={ctx.state} />
          </Card>
        </div>
      </div>
    </div>
  );
});
