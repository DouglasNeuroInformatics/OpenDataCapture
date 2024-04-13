import React from 'react';

import { EditorPane } from '@opendatacapture/editor';

export const MainContent = () => (
  <main className="flex flex-grow flex-col py-4">
    <EditorPane className="h-full min-h-0" defaultValue={''} path={''} />
  </main>
);
