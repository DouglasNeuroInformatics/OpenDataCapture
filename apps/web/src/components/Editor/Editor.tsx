import { useEffect, useState } from 'react';

import { Card } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { twMerge } from 'tailwind-merge';

import { EditorPane } from './EditorPane';
import { EditorTab } from './EditorTab';
import './setup';

export type EditorProps = {
  /** Additional classes to be passed to the card component wrapping the editor */
  className?: string;

  /** The initial text to be displayed in the editor */
  value?: string;
};

export const Editor = ({ className, value }: EditorProps) => {
  const [model, setModel] = useState<monaco.editor.IModel | null>(null);

  useEffect(() => {
    const model = monaco.editor.createModel(value ?? '', 'typescript', monaco.Uri.parse('file:///main.tsx'));
    setModel(model);
    return () => {
      monaco.editor.getModels().forEach((model) => model.dispose());
    };
  }, []);

  return (
    <Card className={twMerge('h-full w-full overflow-hidden', className)}>
      <div className="mb-2 border-b border-slate-200 text-sm">
        <EditorTab label="index.ts" />
      </div>
      <EditorPane model={model} />
    </Card>
  );
};
