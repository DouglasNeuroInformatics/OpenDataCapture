import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const InstrumentEditor = () => {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);
  const [theme] = useTheme();

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
          theme: `odc-${theme}`,
          value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n')
        });
      });
    }

    return () => editor?.dispose();
  }, [monacoEl.current]);

  return (
    <div
      className="flex flex-grow rounded-md shadow-sm ring-1 ring-slate-900/10 dark:ring-slate-100/25"
      ref={monacoEl}
    />
  );
};
