import React from 'react';

import { Editor } from '../Editor';

export const MainContent = () => {
  return (
    <main className="flex flex-grow flex-col py-4">
      <Editor className="h-full min-h-0 border" />
    </main>
  );
};
