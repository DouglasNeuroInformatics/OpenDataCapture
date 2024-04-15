import React, { useEffect } from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import { useInstrumentStore } from '@/store/instrument.store';
import { sha256 } from '@/utils/hash';
import { decodeSource } from '@/utils/share';

const IndexPage = () => {
  const addInstrument = useInstrumentStore((store) => store.addInstrument);
  const setSelectedInstrument = useInstrumentStore((store) => store.setSelectedInstrument);

  const addShareInstrument = async (encodedSource: string) => {
    const source = decodeSource(encodedSource);
    const id = await sha256(source);
    try {
      addInstrument({
        category: 'Saved',
        id,
        kind: 'UNKNOWN',
        label: id.slice(0, 8),
        source
      });
    } catch (err) {
      console.error(err);
    }
    setSelectedInstrument(id);
  };

  useEffect(() => {
    const searchParams = new URL(location.href).searchParams;
    const encodedSource = searchParams.get('source');
    if (!encodedSource) {
      return;
    }
    addShareInstrument(encodedSource).catch(console.error);
  }, [location.href]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden px-8 xl:px-12 2xl:px-16">
      <Header />
      <Separator />
      <MainContent />
    </div>
  );
};

export default IndexPage;
