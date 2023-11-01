import { useEffect, useRef, useState } from 'react';

import { Card, useTheme } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { twMerge } from 'tailwind-merge';

import { EditorTab } from './EditorTab';
import './setup';

export type EditorProps = {
  /** Additional classes to be passed to the card component wrapping the editor */
  className?: string;

  /** The initial text to be displayed in the editor */
  value?: string;
};

export const Editor = ({ className, value }: EditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [model, setModel] = useState<monaco.editor.IModel | null>(null);
  const [theme] = useTheme();

  useEffect(() => {
    const model = monaco.editor.createModel(value ?? '', 'typescript', monaco.Uri.parse('file:///main.tsx'));
    setModel(model);
  }, []);

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

  return (
    <Card className={twMerge('h-full w-full overflow-hidden', className)}>
      <div className="mb-2 border-b border-slate-200 text-sm">
        <EditorTab label="index.ts" />
      </div>
      <div className="h-full min-h-[576px] w-full" ref={ref} />
    </Card>
  );
};
