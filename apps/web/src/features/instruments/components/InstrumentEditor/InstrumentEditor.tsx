import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { HiPlus } from 'react-icons/hi';

import { useFormQuery } from '../../hooks/useFormQuery';

export const InstrumentEditor = () => {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);
  const [theme] = useTheme();
  const form = useFormQuery('653ff2291238677770b5a68b');

  useEffect(() => {
    if (editor) {
      editor.updateOptions({
        theme: `odc-${theme}`
      });
    }
  }, [theme]);

  useEffect(() => {
    if (monacoEl) {
      setEditor((editor) => {
        if (editor) return editor;
        return monaco.editor.create(monacoEl.current!, {
          extraEditorClassName: 'rounded-md',
          language: 'typescript',
          minimap: {
            enabled: false
          },
          theme: `odc-${theme}`
        });
      });
    }

    return () => editor?.dispose();
  }, [monacoEl.current]);

  useEffect(() => {
    if (form.data && editor) {
      editor.setValue(form.data.source);
    }
  }, [form.data]);

  return (
    <div className="flex flex-grow flex-col">
      <div className="flex divide-x divide-slate-500 dark:bg-slate-700 dark:text-slate-300">
        <div className="flex flex-grow items-center p-1.5 text-sm ">Happiness Questionnaire</div>
        <div className="flex items-center justify-center border-slate-200 p-1.5 dark:border-slate-700">
          <HiPlus />
        </div>
      </div>
      <div className="flex flex-grow shadow-sm ring-1 ring-slate-900/10 dark:ring-slate-100/25" ref={monacoEl} />
    </div>
  );
};
