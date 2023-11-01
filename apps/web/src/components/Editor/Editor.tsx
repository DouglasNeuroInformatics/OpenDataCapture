import { useEffect, useState } from 'react';

import { Card } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { twMerge } from 'tailwind-merge';

import { EditorPane } from './EditorPane';
import { EditorTab } from './EditorTab';
import './setup';

import type { EditorFile } from './types';

export type EditorProps = {
  /** Additional classes to be passed to the card component wrapping the editor */
  className?: string;

  /** A list of files to be interpreted as models by the editor */
  files: EditorFile[];
};

export const Editor = ({ className, files }: EditorProps) => {
  const [selectedModel, setSelectedModel] = useState<monaco.editor.IModel | null>(null);

  useEffect(() => {
    for (const file of files) {
      monaco.editor.createModel(file.content, 'typescript', monaco.Uri.parse(file.filename));
    }
    return () => {
      monaco.editor.getModels().forEach((model) => model.dispose());
    };
  }, []);

  return (
    <Card className={twMerge('h-full w-full overflow-hidden', className)}>
      <div className="mb-2 border-b border-slate-200 text-sm">
        <EditorTab label="index.ts" />
      </div>
      <EditorPane model={selectedModel} />
    </Card>
  );
};
