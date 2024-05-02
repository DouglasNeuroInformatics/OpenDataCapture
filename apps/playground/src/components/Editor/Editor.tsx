import React, { useRef, useState } from 'react';

import { extractInputFileExtension } from '@opendatacapture/instrument-bundler';
import { motion } from 'framer-motion';
import { Columns3Icon, FilePlusIcon, FileUpIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { useAppStore } from '@/store';

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

  const addFile = useAppStore((store) => store.addFile);
  const openFilenames = useAppStore((store) => store.openFilenames);
  const filenames = useAppStore(useShallow((store) => store.files.map((file) => file.name)));

  const selectedFilename = useAppStore((store) => store.selectedFilename);
  const deleteFilenameRef = useRef<null | string>(null);

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
          tip="Upload Files"
          onClick={() => {
            setIsUploadFileDialogOpen(true);
          }}
        />
        {openFilenames.map((filename) => (
          <EditorTab filename={filename} key={filename} />
        ))}
      </div>
      <div className="flex h-full">
        <motion.div
          animate={{ width: isSidebarOpen ? 320 : 0 }}
          className="flex-shrink-0 overflow-scroll border-r border-slate-900/10 shadow-sm dark:border-slate-100/25"
          initial={{ width: 0 }}
        >
          <div className="h-full w-full">
            {filenames.map((filename) => (
              <EditorFileButton
                filename={filename}
                isActive={filename === selectedFilename && !isAddingFile}
                key={filename}
                onDelete={() => {
                  deleteFilenameRef.current = filename;
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
                      name: filename
                    });
                  }
                  setIsAddingFile(false);
                }}
              />
            )}
          </div>
        </motion.div>
        {openFilenames.length ? <EditorPane /> : <EditorPanePlaceholder>No File Selected</EditorPanePlaceholder>}
      </div>
      <DeleteFileDialog
        filename={deleteFilenameRef.current}
        isOpen={isDeleteFileDialogOpen}
        setIsOpen={setIsDeleteFileDialogOpen}
      />
      <UploadFileDialog isOpen={isUploadFileDialogOpen} setIsOpen={setIsUploadFileDialogOpen} />
    </div>
  );
};
