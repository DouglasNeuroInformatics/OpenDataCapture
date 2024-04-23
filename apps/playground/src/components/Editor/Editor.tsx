import React, { useRef, useState } from 'react';

import { ContextMenu } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { motion } from 'framer-motion';
import { Columns3Icon, FilePlusIcon, TrashIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import type { EditorFile } from '@/models/editor-file.model';
import { useEditorStore } from '@/store/editor.store';
import { resolveIndexFile } from '@/utils/resolve';

import { DeleteFileDialog } from './DeleteFileDialog';
import { EditorAddFileButton } from './EditorAddFileButton';
import { EditorButton } from './EditorButton';
import { EditorEmptyState } from './EditorEmptyState';
import { EditorFileIcon } from './EditorFileIcon';
import { EditorPane } from './EditorPane';
import { EditorTab } from './EditorTab';
import { fileExtRegex } from './utils';

import './setup';

export const Editor = () => {
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = useState(false);
  const { addFile, files, openFiles, selectFile, selectedFile } = useEditorStore(
    useShallow(({ addFile, files, openFiles, selectFile, selectedFile }) => ({
      addFile,
      files,
      openFiles,
      selectFile,
      selectedFile
    }))
  );
  const deleteFileRef = useRef<EditorFile | null>(null);
  const indexFile = resolveIndexFile(files);

  return (
    <div className="flex h-full w-full flex-col border border-r-0 bg-slate-50 dark:bg-slate-800">
      <div className="flex w-full border-b">
        <EditorButton icon={<Columns3Icon />} tip="View Files" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <EditorButton
          icon={<FilePlusIcon />}
          tip="Add File"
          onClick={() => {
            setIsSidebarOpen(true);
            setIsAddFileOpen(true);
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
              <ContextMenu key={file.name}>
                <ContextMenu.Trigger asChild>
                  <button
                    className={cn(
                      'flex w-full items-center gap-2 p-2 text-sm',
                      selectedFile?.name === file.name && !isAddFileOpen && 'bg-slate-100 dark:bg-slate-700'
                    )}
                    type="button"
                    onClick={() => selectFile(file)}
                  >
                    <EditorFileIcon filename={file.name} />
                    <span className="truncate">{file.name}</span>
                  </button>
                </ContextMenu.Trigger>
                <ContextMenu.Content className="w-64">
                  <ContextMenu.Item
                    disabled={file === indexFile}
                    onSelect={() => {
                      deleteFileRef.current = file;
                      setIsDeleteFileDialogOpen(true);
                    }}
                  >
                    <TrashIcon />
                    <span className="ml-2 text-sm">Delete</span>
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu>
            ))}
            {isAddFileOpen && (
              <EditorAddFileButton
                onBlur={() => setIsAddFileOpen(false)}
                onSubmit={(filename) => {
                  const ext = filename.match(fileExtRegex)?.[0];
                  if (ext) {
                    addFile({
                      id: crypto.randomUUID(),
                      language: 'typescript',
                      name: filename,
                      value: ''
                    });
                  }
                  setIsAddFileOpen(false);
                }}
              />
            )}
          </div>
        </motion.div>
        {openFiles.length ? <EditorPane /> : <EditorEmptyState />}
      </div>
      <DeleteFileDialog
        file={deleteFileRef.current}
        isOpen={isDeleteFileDialogOpen}
        setIsOpen={setIsDeleteFileDialogOpen}
      />
    </div>
  );
};
