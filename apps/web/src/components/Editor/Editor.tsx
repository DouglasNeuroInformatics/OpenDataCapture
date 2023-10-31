import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export type EditorProps = {
  /** The initial text to be displayed in the editor */
  value?: string;
};

export const Editor = ({ value }: EditorProps) => {
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
        return editor
          ? editor
          : monaco.editor.create(monacoEl.current!, {
              language: 'typescript',
              minimap: {
                enabled: false
              },
              theme: `odc-${theme}`,
              value
            });
      });
    }
    return () => editor?.dispose();
  }, [monacoEl.current]);

  return <div className="shadow-sm h-96  ring-1 ring-slate-900/10 dark:ring-slate-100/25" ref={monacoEl} />;
};
