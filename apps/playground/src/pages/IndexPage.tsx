import { useEffect } from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import type { InstrumentRepository } from '@/models/instrument-repository.model';
import { useAppStore } from '@/store';
import { decodeShareURL } from '@/utils/encode';

const { initialize } = await import('esbuild-wasm');
await initialize({
  wasmURL: esbuildWasmUrl
});

const IndexPage = () => {
  const addInstrument = useAppStore((store) => store.addInstrument);
  const setSelectedInstrument = useAppStore((store) => store.setSelectedInstrument);
  const removeInstrument = useAppStore((store) => store.removeInstrument);
  const instruments = useAppStore((store) => store.instruments);

  const isSameInstrument = (
    instrumentA: Pick<InstrumentRepository, 'files'>,
    instrumentB: Pick<InstrumentRepository, 'files'>
  ) => {
    if (instrumentA.files.length !== instrumentB.files.length) {
      return false;
    }
    for (const fileA of instrumentA.files) {
      const fileB = instrumentB.files.find((file) => file.name === fileA.name);
      if (!fileB || fileA.content !== fileB.content) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    let id: null | string = null;
    try {
      const decodedInstrument = decodeShareURL(new URL(location.href));
      if (!decodedInstrument) {
        return;
      }

      // If the instrument is exactly the same, go to existing instead of creating duplicate
      const existingInstrument = instruments.find(({ label }) => label === decodedInstrument.label);
      if (existingInstrument && isSameInstrument(decodedInstrument, existingInstrument)) {
        setSelectedInstrument(existingInstrument.id);
        return;
      }

      id = crypto.randomUUID();
      let suffixNumber = 1;
      let uniqueLabel = decodedInstrument.label;

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
