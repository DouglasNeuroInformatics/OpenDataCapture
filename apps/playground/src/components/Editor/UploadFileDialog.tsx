import React, { useCallback, useEffect, useState } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { CloudUploadIcon } from 'lucide-react';
import { type FileRejection, useDropzone } from 'react-dropzone';

import { useEditorFilesRef } from '@/hooks/useEditorFilesRef';
import type { EditorFile } from '@/models/editor-file.model';
import { useAppStore } from '@/store';
import { loadNativeFileContent } from '@/utils/load';

export type UploadFileDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UploadFileDialog = ({ isOpen, setIsOpen }: UploadFileDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [files, setFiles] = useState<File[]>([]);
  const addFiles = useAppStore((store) => store.addFiles);
  const filesRef = useEditorFilesRef();

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      for (const { errors, file } of rejections) {
        addNotification({ message: `Invalid file type: ${file.name} `, type: 'error' });
        console.error(errors);
        setIsOpen(false);
        return;
      }
      const existingFilenames = filesRef.current.map((file) => file.name);
      for (const file of acceptedFiles) {
        if (existingFilenames.includes(file.name)) {
          addNotification({ message: `File already exists: ${file.name}`, type: 'error' });
          setIsOpen(false);
          return;
        }
      }
      setFiles(acceptedFiles);
    },
    [setFiles]
  );

  useEffect(() => {
    setFiles([]);
  }, [isOpen]);

  const submitFiles = async (files: File[]) => {
    const editorFiles: EditorFile[] = [];
    for (const file of files) {
      editorFiles.push({
        content: await loadNativeFileContent(file),
        name: file.name
      });
    }
    addFiles(editorFiles);
    setIsOpen(false);
  };

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/css': ['.css'],
      'text/plain': ['.js', '.jsx', '.ts', '.tsx']
    },
    onDrop: handleDrop
  });

  let dropzoneText: string;
  if (files.length > 1) {
    dropzoneText = `${files[0].name} + ${files.length - 1}`;
  } else if (files.length === 1) {
    dropzoneText = files[0].name;
  } else if (isDragActive) {
    dropzoneText = 'Release your cursor to upload file(s)';
  } else {
    dropzoneText = 'Click here to upload, or drag and drop files into this area';
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Upload Files</Dialog.Title>
        </Dialog.Header>
        <div
          className="text-muted-foreground flex h-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-sm"
          {...getRootProps()}
        >
          <CloudUploadIcon style={{ height: 40, width: 40 }} />
          <p className="mt-3 text-center text-sm">{dropzoneText}</p>
          <input {...getInputProps()} />
        </div>
        <Dialog.Footer>
          <Button
            className="w-full"
            disabled={files.length === 0}
            type="button"
            onClick={() => void submitFiles(files)}
          >
            Submit
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
