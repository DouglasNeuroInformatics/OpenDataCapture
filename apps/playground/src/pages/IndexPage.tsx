import React, { useEffect } from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import { useInstrumentStore } from '@/store/instrument.store';
import { decodeFiles } from '@/utils/encode';
import { hashFiles } from '@/utils/hash';

const IndexPage = () => {
  const addInstrument = useInstrumentStore((store) => store.addInstrument);
  const setSelectedInstrument = useInstrumentStore((store) => store.setSelectedInstrument);

  const addShareInstrument = async (encodedFiles: string) => {
    const files = decodeFiles(encodedFiles);
    const id = await hashFiles(files);
    try {
      addInstrument({
        category: 'Saved',
        files,
        id,
        kind: 'UNKNOWN',
        label: id.slice(0, 8)
      });
    } catch (err) {
      console.error(err);
    }
    setSelectedInstrument(id);
  };

  useEffect(() => {
    const searchParams = new URL(location.href).searchParams;
    const encodedFiles = searchParams.get('files');
    if (!encodedFiles) {
      return;
    }
    addShareInstrument(encodedFiles).catch(console.error);
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
