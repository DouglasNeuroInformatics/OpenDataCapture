import React, { useEffect } from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import { type InstrumentStoreItem, useInstrumentStore } from '@/store/instrument.store';
import { decodeShareURL } from '@/utils/encode';
import { hashFiles } from '@/utils/hash';

const IndexPage = () => {
  const addInstrument = useInstrumentStore((store) => store.addInstrument);
  const setSelectedInstrument = useInstrumentStore((store) => store.setSelectedInstrument);

  const addShareInstrument = async ({ files, label }: Pick<InstrumentStoreItem, 'files' | 'label'>) => {
    const id = await hashFiles(files);
    try {
      addInstrument({
        category: 'Saved',
        files,
        id,
        kind: 'UNKNOWN',
        label
      });
    } catch (err) {
      console.error(err);
    }
    setSelectedInstrument(id);
  };

  useEffect(() => {
    const decoded = decodeShareURL(new URL(location.href));
    if (!decoded) {
      return;
    }
    addShareInstrument(decoded).catch(console.error);
  }, [location.href]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden px-4">
      <Header />
      <Separator />
      <MainContent />
    </div>
  );
};

export default IndexPage;
