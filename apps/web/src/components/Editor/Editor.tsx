import { useEffect, useRef, useState } from 'react';

import { Card, useTheme } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { HiXMark } from 'react-icons/hi2';
import { twMerge } from 'tailwind-merge';

export type EditorProps = {
  /** Additional classes to be passed to the card component wrapping the editor */
  className?: string;

  /** The initial text to be displayed in the editor */
  value?: string;
};

export const Editor = ({ className, value }: EditorProps) => {
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
              scrollBeyondLastLine: false,
              theme: `odc-${theme}`,
              value
            });
      });
    }
    return () => {
      editor?.dispose();
    };
  }, [monacoEl.current]);

  return (
    <Card className={twMerge('h-full w-full overflow-hidden', className)}>
      <div className="mb-2 border-b border-slate-200 text-sm">
        <div className="flex items-center justify-center px-6 py-2 hover:bg-slate-100">
          <span>index.ts</span>
          <button className="justify-self-end rounded-md p-0.5 hover:bg-slate-200">
            <HiXMark />
          </button>
        </div>
      </div>
      <div className="h-full min-h-[576px] w-full" ref={monacoEl} />
    </Card>
  );
};
