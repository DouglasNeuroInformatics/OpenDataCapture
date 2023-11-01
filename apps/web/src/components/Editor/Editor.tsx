import { useEffect, useState } from 'react';

import { ArrowToggle, Card } from '@douglasneuroinformatics/ui';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { twMerge } from 'tailwind-merge';

import { EditorEmptyState } from './EditorEmptyState';
import { EditorPane } from './EditorPane';
import { EditorSidebar } from './EditorSidebar';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      <div className="flex divide-x divide-slate-200 border-b border-slate-200 text-sm">
        <ArrowToggle
          className="p-2"
          position="right"
          rotation={180}
          type="button"
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
        />
        <EditorTab label="index.ts" />
      </div>
      <div className="flex min-h-[576px]">
        <EditorSidebar isOpen={isSidebarOpen} />
        {selectedModel ? <EditorPane model={selectedModel} /> : <EditorEmptyState />}
      </div>
    </Card>
  );
};
