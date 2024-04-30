import React, { useRef, useState } from 'react';

import { extractInputFileExtension } from '@opendatacapture/instrument-bundler';
import { motion } from 'framer-motion';
import { Columns3Icon, FilePlusIcon, FileUpIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import type { EditorFile } from '@/models/editor-file.model';
import { useEditorStore } from '@/store/editor.store';

import { DeleteFileDialog } from './DeleteFileDialog';
import { EditorAddFileButton } from './EditorAddFileButton';
import { EditorButton } from './EditorButton';
import { EditorFileButton } from './EditorFileButton';
import { EditorPane } from './EditorPane';
import { EditorPanePlaceholder } from './EditorPanePlaceholder';
import { EditorTab } from './EditorTab';
import { UploadFileDialog } from './UploadFileDialog';

import './setup';

export const Editor = () => {
  const [isAddingFile, setIsAddingFile] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isUploadFileDialogOpen, setIsUploadFileDialogOpen] = useState(false);
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = useState(false);

  const { addFile, files, openFiles } = useEditorStore(
    useShallow(({ addFile, files, openFiles }) => ({
      addFile,
      files,
      openFiles
    }))
  );
  const selectedFilename = useEditorStore((store) => store.selectedFile?.name);
  const deleteFileRef = useRef<EditorFile | null>(null);

  return (
    <div className="flex h-full w-full flex-col border border-r-0 bg-slate-50 dark:bg-slate-800">
      <div className="flex w-full border-b">
        <EditorButton icon={<Columns3Icon />} tip="View Files" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <EditorButton
          icon={<FilePlusIcon />}
          tip="Add File"
          onClick={() => {
            setIsSidebarOpen(true);
            setIsAddingFile(true);
          }}
        />
        <EditorButton
          icon={<FileUpIcon />}
          tip="Upload File"
          onClick={() => {
            setIsUploadFileDialogOpen(true);
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
              <EditorFileButton
                file={file}
                isActive={file.name === selectedFilename && !isAddingFile}
                key={file.id}
                onDelete={() => {
                  deleteFileRef.current = file;
                  setIsDeleteFileDialogOpen(true);
                }}
              />
            ))}
            {isAddingFile && (
              <EditorAddFileButton
                onBlur={() => setIsAddingFile(false)}
                onSubmit={(filename) => {
                  const ext = extractInputFileExtension(filename);
                  if (ext) {
                    addFile({
                      content: '',
                      id: crypto.randomUUID(),
                      name: filename
                    });
                  }
                  setIsAddingFile(false);
                }}
              />
            )}
          </div>
        </motion.div>
        {openFiles.length ? <EditorPane /> : <EditorPanePlaceholder>No File Selected</EditorPanePlaceholder>}
      </div>
      <DeleteFileDialog
        file={deleteFileRef.current}
        isOpen={isDeleteFileDialogOpen}
        setIsOpen={setIsDeleteFileDialogOpen}
      />
      <UploadFileDialog isOpen={isUploadFileDialogOpen} setIsOpen={setIsUploadFileDialogOpen} />
    </div>
  );
};
