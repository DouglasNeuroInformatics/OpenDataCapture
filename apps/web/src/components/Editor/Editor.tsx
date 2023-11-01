import React, { useEffect, useState } from 'react';

import { ArrowToggle, Card } from '@douglasneuroinformatics/ui';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { twMerge } from 'tailwind-merge';

import { EditorEmptyState } from './EditorEmptyState';
import { EditorHelpModal } from './EditorHelpModal';
import { EditorPane } from './EditorPane';
import { EditorSidebar } from './EditorSidebar';
import { EditorTab } from './EditorTab';
import './setup';

import type { EditorFile, EditorModel } from './types';

export type EditorProps = {
  /** Additional classes to be passed to the card component wrapping the editor */
  className?: string;

  /** A list of files to be interpreted as models by the editor */
  files: EditorFile[];
};

export const Editor = ({ className, files }: EditorProps) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [models, setModels] = useState<EditorModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<monaco.editor.IModel | null>(null);

  useEffect(() => {
    setModels(() =>
      files.map((file) => {
        return monaco.editor.createModel(file.content, 'typescript', monaco.Uri.parse(file.filename));
      })
    );
    return () => {
      monaco.editor.getModels().forEach((model) => model.dispose());
    };
  }, []);

  return (
    <React.Fragment>
      <Card className={twMerge('h-full w-full overflow-hidden', className)}>
        <div className="flex justify-between border-b border-slate-900/10 dark:border-slate-100/25">
          <div className="flex divide-x divide-slate-900/10 text-sm dark:divide-slate-100/25">
            <ArrowToggle
              className="p-2"
              position="right"
              rotation={180}
              type="button"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
            />
            {selectedModel && <EditorTab label={selectedModel?.uri.path.slice(1)} />}
          </div>
          <button
            className="flex items-center justify-center p-2"
            type="button"
            onClick={() => {
              setIsHelpModalOpen(true);
            }}
          >
            <QuestionMarkCircleIcon height={14} width={14} />
          </button>
        </div>
        <div className="flex min-h-[576px]">
          <EditorSidebar
            isOpen={isSidebarOpen}
            models={models}
            onSelection={(id) => {
              setSelectedModel(models.find((model) => model.id === id) ?? null);
            }}
          />
          {selectedModel ? <EditorPane model={selectedModel} /> : <EditorEmptyState />}
        </div>
      </Card>
      <EditorHelpModal isOpen={isHelpModalOpen} setIsOpen={setIsHelpModalOpen} />
    </React.Fragment>
  );
};
