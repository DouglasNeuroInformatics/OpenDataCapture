import { useEffect, useMemo, useRef, useState } from 'react';

import { useInterval, useMediaQuery } from '@douglasneuroinformatics/ui';
import { type EditorPaneRef } from '@open-data-capture/react-core/components/Editor';

import { EditorContext } from '@/context/EditorContext';
import { type ExampleInstrumentData, defaultExample, examples } from '@/examples';
import { useRuntime } from '@/hooks/useRuntime';
import { useTranspiler } from '@/hooks/useTranspiler';

import { DesktopEditor } from './DesktopEditor';
import { MobileEditor } from './MobileEditor';

export const Editor = () => {
  const { setSource, source, state } = useTranspiler();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const ref = useRef<EditorPaneRef>(null);
  const [selectedExample, setSelectedExample] = useState<ExampleInstrumentData>(defaultExample);

  const { libs } = useRuntime('v0.0.1');

  useEffect(() => {
    const monaco = ref.current?.monaco;
    if (!monaco) {
      return;
    }
    Object.keys(libs).forEach((filename) => {
      const uri = monaco.Uri.parse(filename);
      if (!monaco.editor.getModel(uri)) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(libs[filename], filename);
        monaco.editor.createModel(libs[filename], 'typescript', monaco.Uri.parse(filename));
      }
    });
  }, [libs]);

  useInterval(() => {
    setSource(ref.current?.editor?.getValue() ?? null);
  }, 2000);

  const exampleOptions = useMemo(() => {
    return examples.map((instrument) => instrument.label).sort();
  }, [examples]);

  const handleChangeSelection = (label: string) => {
    const selection = examples.find((example) => example.label === label);
    if (selection) {
      setSelectedExample(selection);
    }
  };

  return (
    <EditorContext.Provider
      value={{ exampleOptions, onChangeSelection: handleChangeSelection, selectedExample, source, state }}
    >
      <div className="mx-auto flex h-screen max-w-screen-2xl flex-col p-2">
        <header className="my-6 lg:my-8">
          <h1 className="text-center text-xl font-semibold">Instrument Playground</h1>
        </header>
        <main className="h-full min-h-0">{isDesktop ? <DesktopEditor ref={ref} /> : <MobileEditor ref={ref} />}</main>
      </div>
    </EditorContext.Provider>
  );
};
