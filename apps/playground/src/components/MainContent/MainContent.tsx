import React from 'react';

import { Resizable, Tabs } from '@douglasneuroinformatics/libui/components';
import { useMediaQuery } from '@douglasneuroinformatics/libui/hooks';

import { Editor } from '../Editor';
import { Viewer } from '../Viewer';

export const MainContent = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return (
    <main className="flex flex-grow flex-col overflow-hidden py-4">
      {isDesktop ? (
        <Resizable.PanelGroup direction="horizontal">
          <Resizable.Panel defaultSize={66} minSize={25}>
            <Editor />
          </Resizable.Panel>
          <Resizable.Handle className="mr-12" />
          <Resizable.Panel defaultSize={34} minSize={25}>
            <Viewer />
          </Resizable.Panel>
        </Resizable.PanelGroup>
      ) : (
        <Tabs className="flex flex-grow flex-col overflow-hidden" defaultValue="editor">
          <Tabs.List className="grid w-full grid-cols-2">
            <Tabs.Trigger value="editor">Editor</Tabs.Trigger>
            <Tabs.Trigger value="viewer">Viewer</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="flex-grow" value="editor">
            <Editor />
          </Tabs.Content>
          <Tabs.Content className="flex-grow overflow-hidden pt-6" value="viewer">
            <Viewer />
          </Tabs.Content>
        </Tabs>
      )}
    </main>
  );
};
