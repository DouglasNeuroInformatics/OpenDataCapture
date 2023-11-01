import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export type EditorPaneProps = {
  model: monaco.editor.IModel | null;
};

export const EditorPane = ({ model }: EditorPaneProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [theme] = useTheme();

  useEffect(() => {
    if (ref.current) {
      setEditor((editor) => {
        return editor
          ? editor
          : monaco.editor.create(ref.current!, {
              automaticLayout: true,
              language: 'typescript',
              minimap: {
                enabled: false
              },
              scrollBeyondLastLine: false,
              theme: `odc-${theme}`
            });
      });
    }
    return () => {
      editor?.dispose();
    };
  }, [ref.current]);

  useEffect(() => {
    if (editor && model) {
      editor.setModel(model);
    }
  }, [editor, model]);

  useEffect(() => {
    if (editor) {
      editor.updateOptions({
        theme: `odc-${theme}`
      });
    }
  }, [theme]);

  return <div className="h-full min-h-[576px] w-full" ref={ref} />;
};
