import React from 'react';

import { EditorPane } from '@opendatacapture/editor';

import { useInstrumentStore } from '@/store/instrument.store';

export const MainContent = () => {
  const { selectedInstrument } = useInstrumentStore();
  return (
    <main className="flex flex-grow flex-col py-4">
      <EditorPane className="h-full min-h-0 border" defaultValue={selectedInstrument?.source ?? ''} path={'vfv'} />
    </main>
  );
};
