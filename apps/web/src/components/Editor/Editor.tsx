import { useEffect, useRef, useState } from 'react';

import { ArrowToggle, Card, useTheme } from '@douglasneuroinformatics/ui';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { twMerge } from 'tailwind-merge';

import { MobileBlocker } from '../MobileBlocker';
import { EditorEmptyState } from './EditorEmptyState';
import { EditorHelpModal } from './EditorHelpModal';
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
  const [openModels, setOpenModels] = useState<EditorModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<EditorModel | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const [theme] = useTheme();
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  // On initial mount, generate models for the given files
  useEffect(() => {
    setModels(() =>
      files.map((file) => {
        return monaco.editor.createModel(file.content, 'typescript', monaco.Uri.parse(file.filename));
      })
    );
    return () => {
      monaco.editor.getModels().forEach((model) => model.dispose());
    };
  }, [files]);

  // Once the ref and models are assigned, create the editor and assign it to the state variable
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
              model: null,
              scrollBeyondLastLine: false,
              tabSize: 2,
              theme: `odc-${theme}`
            });
      });
    }
    return () => {
      editor?.dispose();
    };
  }, [ref.current]);

  useEffect(() => {
    if (editor) {
      editor.updateOptions({
        theme: `odc-${theme}`
      });
    }
  }, [theme]);

  useEffect(() => {
    editor?.setModel(selectedModel);
  }, [selectedModel]);

  const handleCloseModel = (id: string) => {
    setOpenModels((prevModels) => {
      const currentIndex = prevModels.findIndex((model) => model.id === id);
      const updatedModels = prevModels.filter((model) => model.id !== id);
      setSelectedModel(updatedModels.at(currentIndex - 1) ?? null);
      return updatedModels;
    });
  };

  const handleSelectModel = (id: string) => {
    const model = models.find((model) => model.id === id);
    if (!model) {
      console.error(`Failed to find model with ID: ${id}`);
      return;
    }
    const isOpen = openModels.some(({ id }) => id === model.id);
    if (!isOpen) {
      setOpenModels((prevModels) => [...prevModels, model]);
    }
    setSelectedModel(model);
  };

  return (
    <MobileBlocker>
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
            {openModels.map((model) => (
              <EditorTab
                isActive={model.id === selectedModel?.id}
                key={model.id}
                model={model}
                onClose={handleCloseModel}
                onSelection={handleSelectModel}
              />
            ))}
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
            selectedModel={selectedModel}
            onSelection={handleSelectModel}
          />
          <div
            className={clsx('h-full w-full', !selectedModel && 'hidden')}
            ref={ref}
            style={{ minHeight: 'inherit' }}
          />
          {!selectedModel && <EditorEmptyState />}
        </div>
      </Card>
      <EditorHelpModal isOpen={isHelpModalOpen} setIsOpen={setIsHelpModalOpen} />
    </MobileBlocker>
  );
};
