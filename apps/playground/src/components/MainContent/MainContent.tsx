import React from 'react';

import { Resizable } from '@douglasneuroinformatics/libui/components';

import { Editor } from '../Editor';
import { Viewer } from '../Viewer';

export const MainContent = () => {
  return (
    <main className="flex flex-grow flex-col overflow-hidden py-4">
      <Resizable.PanelGroup direction="horizontal">
        <Resizable.Panel defaultSize={66} minSize={25}>
          <Editor />
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel defaultSize={34} minSize={25}>
          <Viewer />
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </main>
  );
};
