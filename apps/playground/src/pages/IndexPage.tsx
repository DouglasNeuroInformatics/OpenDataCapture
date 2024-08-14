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
      const decodedInstrument = decodeShareURL(new URL(location.href));
      if (!decodedInstrument) {
        return;
      }
      id = crypto.randomUUID();
      let suffixNumber = 1;
      let uniqueLabel = decodedInstrument.label;

      const previousInstrument = instruments.find((formInstrument) => formInstrument.label === uniqueLabel);

      if (previousInstrument?.files.every((file, index) => file.content === decodedInstrument.files[index].content)) {
        //go to previous existing form instead of creating duplicate
        setSelectedInstrument(previousInstrument.id);
      } else {
        //look for forms without the same content but the same name
        // and add a new version with a suffix
        while (instruments.find((instrument) => instrument.label === uniqueLabel)) {
          uniqueLabel = `${decodedInstrument.label} (${suffixNumber})`;
          suffixNumber++;
        }
        addInstrument({
          category: 'Saved',
          files: decodedInstrument.files,
          id,
          kind: 'UNKNOWN',
          label: uniqueLabel
        });
        setSelectedInstrument(id);
      }
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
