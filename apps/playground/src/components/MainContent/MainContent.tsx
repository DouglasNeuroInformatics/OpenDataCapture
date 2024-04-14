import React from 'react';

import { Resizable } from '@douglasneuroinformatics/libui/components';

import { Editor } from '../Editor';

export const MainContent = () => {
  return (
    <main className="flex flex-grow flex-col py-4">
      <Resizable.PanelGroup direction="horizontal">
        <Resizable.Panel defaultSize={50} minSize={25}>
          <Editor className="h-full min-h-0 border" />
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel defaultSize={50} minSize={25}></Resizable.Panel>
      </Resizable.PanelGroup>
    </main>
  );
};
