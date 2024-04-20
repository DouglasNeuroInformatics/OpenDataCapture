import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';

import { useEditorStore } from '@/store/editor.store';

import { EditorFileIcon } from './EditorFileIcon';

export type EditorSidebarProps = {
  isOpen: boolean;
};

export const EditorSidebar = ({ isOpen }: EditorSidebarProps) => {
  const { files, selectFile, selectedFile } = useEditorStore(
    useShallow(({ files, selectFile, selectedFile }) => ({ files, selectFile, selectedFile }))
  );
  return (
    <motion.div
      animate={{ width: isOpen ? 320 : 0 }}
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
  );
};
