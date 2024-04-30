import React, { useCallback, useEffect, useState } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { CloudUploadIcon } from 'lucide-react';
import { type FileRejection, useDropzone } from 'react-dropzone';

import { useEditorStore } from '@/store/editor.store';
import { loadNativeFileContent } from '@/utils/load';

export type UploadFileDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UploadFileDialog = ({ isOpen, setIsOpen }: UploadFileDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [file, setFile] = useState<File | null>(null);
  const addFile = useEditorStore((store) => store.addFile);

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      for (const { errors, file } of rejections) {
        setIsOpen(false);
        addNotification({ message: `Invalid File: ${file.name} `, type: 'error' });
        console.error(errors);
        return;
      }
      setFile(acceptedFiles[0] ?? null);
    },
    [setFile]
  );

  useEffect(() => {
    setFile(null);
  }, [isOpen]);

  const submitFile = async (file: File) => {
    addFile({
      content: await loadNativeFileContent(file),
      id: crypto.randomUUID(),
      name: file.name
    });
    setIsOpen(false);
  };

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/css': ['.css'],
      'text/plain': ['.js', '.jsx', '.ts', '.tsx']
    },
    maxFiles: 1,
    onDrop: handleDrop
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Upload File</Dialog.Title>
        </Dialog.Header>
        <div
          className="text-muted-foreground flex h-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-sm"
          {...getRootProps()}
        >
          <CloudUploadIcon style={{ height: 40, width: 40 }} />
          <p className="mt-3 text-center text-sm">
            {file
              ? file.name
              : isDragActive
                ? 'Release your cursor to upload file'
                : 'Click here to upload a file, or drag and drop it into this area'}
          </p>
          <input {...getInputProps()} />
        </div>
        <Dialog.Footer>
          <Button className="w-full" disabled={!file} type="button" onClick={() => void submitFile(file!)}>
            Submit
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
