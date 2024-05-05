import React, { useRef, useState } from 'react';

import { extractInputFileExtension } from '@opendatacapture/instrument-bundler';
import { motion } from 'framer-motion';
import { Columns3Icon, FilePlusIcon, FileUpIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { useAppStore } from '@/store';
import { isImageLikeFileExtension } from '@/utils/file';
import { loadEditorFilesFromNative } from '@/utils/load';

import { FileUploadDialog } from '../FileUploadDialog';
import { DeleteFileDialog } from './DeleteFileDialog';
import { EditorAddFileButton } from './EditorAddFileButton';
import { EditorButton } from './EditorButton';
import { EditorFileButton } from './EditorFileButton';
import { EditorPane } from './EditorPane';
import { EditorPanePlaceholder } from './EditorPanePlaceholder';
import { EditorTab } from './EditorTab';

import './setup';

export const Editor = () => {
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = useState(false);

  const addFile = useAppStore((store) => store.addFile);
  const addFiles = useAppStore((store) => store.addFiles);
  const openFilenames = useAppStore((store) => store.openFilenames);
  const filenames = useAppStore(
    useShallow((store) =>
      store.files
        .map((file) => file.name)
        .toSorted((a, b) => {
          if (a === store.indexFilename) {
            return -1;
          } else if (b === store.indexFilename) {
            return 1;
          }
          const aIsImgLike = isImageLikeFileExtension(a);
          const bIsImgLike = isImageLikeFileExtension(b);
          if (aIsImgLike && !bIsImgLike) {
            return 1;
          } else if (bIsImgLike && !aIsImgLike) {
            return -1;
          }
          return a.localeCompare(b);
        })
    )
  );

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
            setIsFileUploadDialogOpen(true);
          }}
        />
        {openFilenames.map((filename) => (
          <EditorTab filename={filename} key={filename} />
        ))}
      </div>
      <div className="flex h-full overflow-hidden">
        <motion.div
          animate={{ width: isSidebarOpen ? 320 : 0 }}
          className="h-full flex-shrink-0 overflow-scroll border-r border-slate-900/10 shadow-sm dark:border-slate-100/25"
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
      <FileUploadDialog
        accept={{
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/webp': ['.webp'],
          'text/css': ['.css'],
          'text/html': ['.html'],
          'text/plain': ['.js', '.jsx', '.ts', '.tsx']
        }}
        isOpen={isFileUploadDialogOpen}
        setIsOpen={setIsFileUploadDialogOpen}
        title="Upload Files"
        onSubmit={async (files) => {
          const editorFiles = await loadEditorFilesFromNative(files);
          addFiles(editorFiles);
          setIsFileUploadDialogOpen(false);
        }}
        onValidate={(files: File[]) => {
          for (const file of files) {
            if (filenames.includes(file.name)) {
              return { message: `File already exists: ${file.name}`, result: 'error' };
            }
          }
          return { result: 'success' };
        }}
      />
    </div>
  );
};
