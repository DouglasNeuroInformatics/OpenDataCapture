import React, { useState } from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { motion } from 'framer-motion';
import { Columns3Icon, FilePlusIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { useEditorStore } from '@/store/editor.store';

import { EditorButton } from './EditorButton';
import { EditorEmptyState } from './EditorEmptyState';
import { EditorFileIcon } from './EditorFileIcon';
import { EditorPane } from './EditorPane';
import { EditorTab } from './EditorTab';

import './setup';

export const Editor = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { files, openFiles, selectFile, selectedFile } = useEditorStore(
    useShallow(({ files, openFiles, selectFile, selectedFile }) => ({ files, openFiles, selectFile, selectedFile }))
  );
  return (
    <div className="flex h-full w-full flex-col border border-r-0 bg-slate-50 dark:bg-slate-800">
      <div className="flex w-full border-b">
        <EditorButton icon={<Columns3Icon />} tip="View Files" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <EditorButton
          icon={<FilePlusIcon />}
          tip="Add File"
          onClick={() => {
            setIsSidebarOpen(true);
          }}
        />
        {openFiles.map((file) => (
          <EditorTab file={file} key={file.name} />
        ))}
      </div>
      <div className="flex h-full">
        <motion.div
          animate={{ width: isSidebarOpen ? 320 : 0 }}
          className="flex-shrink-0 overflow-hidden shadow-sm"
          initial={{ width: 0 }}
        >
          <div className="h-full w-full border-r border-slate-900/10 dark:border-slate-100/25">
            {files.map((file) => (
              <button
                className={cn(
                  'flex w-full items-center gap-2 p-2 text-sm',
                  selectedFile?.name === file.name && 'bg-slate-100 dark:bg-slate-700'
                )}
                key={file.name}
                type="button"
                onClick={() => selectFile(file)}
              >
                <EditorFileIcon
                  variant={file.name.endsWith('.jsx') || file.name.endsWith('tsx') ? 'react' : file.language}
                />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
        {openFiles.length ? <EditorPane /> : <EditorEmptyState />}
      </div>
    </div>
  );
};
