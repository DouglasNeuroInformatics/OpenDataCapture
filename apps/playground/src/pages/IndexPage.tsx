import React, { useEffect } from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import { useAppStore } from '@/store';
import { decodeShareURL } from '@/utils/encode';

const IndexPage = () => {
  const addInstrument = useAppStore((store) => store.addInstrument);
  const setSelectedInstrument = useAppStore((store) => store.setSelectedInstrument);
  const removeInstrument = useAppStore((store) => store.removeInstrument);
  const instruments = useAppStore((store) => store.instruments);

  useEffect(() => {
    let id: null | string = null;
    try {
      const instrument = decodeShareURL(new URL(location.href));
      if (!instrument) {
        return;
      }
      id = crypto.randomUUID();
      let suffixNumber = 1;
      let uniqueLabel = instrument.label;
      while (instruments.find((instrument) => instrument.label === uniqueLabel)) {
        uniqueLabel = `${instrument.label} (${suffixNumber})`;
        suffixNumber++;
      }
      addInstrument({
        category: 'Saved',
        files: instrument.files,
        id,
        kind: 'UNKNOWN',
        label: uniqueLabel
      });
      setSelectedInstrument(id);
    } catch (err) {
      console.error(err);
    }
    return () => {
      if (id) {
        removeInstrument(id);
      }
    };
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
