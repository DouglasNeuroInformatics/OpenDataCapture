import React, { useCallback, useEffect, useState } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { CloudUploadIcon } from 'lucide-react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import type { Promisable } from 'type-fest';

type FileUploadValidateResult = { message: string; result: 'error' } | { result: 'success' };

export type FileUploadDialogProps = {
  accept: { [key: string]: string[] };
  isOpen: boolean;
  onSubmit: (files: File[]) => Promisable<void>;
  onValidate?: (files: File[]) => FileUploadValidateResult;
  setIsOpen: (value: boolean) => void;
  title: string;
};

export const FileUploadDialog = ({ accept, isOpen, onSubmit, onValidate, setIsOpen, title }: FileUploadDialogProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      for (const { errors, file } of rejections) {
        setErrorMessage(`Invalid file type: ${file.name} `);
        console.error(errors);
        return;
      }
      const validation = onValidate?.(acceptedFiles);
      if (validation?.result === 'error') {
        setErrorMessage(validation.message);
        return;
      }
      setFiles(acceptedFiles);
      setErrorMessage(null);
    },
    [setFiles, setErrorMessage, onValidate]
  );

  useEffect(() => {
    if (errorMessage) {
      setFiles([]);
    }
  }, [errorMessage]);

  useEffect(() => {
    setFiles([]);
    setErrorMessage(null);
  }, [isOpen]);

  const submitFiles = async (files: File[]) => {
    await onSubmit(files);
  };

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept,
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
          <Dialog.Title>{title}</Dialog.Title>
        </Dialog.Header>
        <div className="text-muted-foreground flex h-full flex-col text-sm">
          <div
            className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6"
            {...getRootProps()}
          >
            <CloudUploadIcon style={{ height: 40, width: 40 }} />
            <p className="mt-3 text-center text-sm">{dropzoneText}</p>
            <input {...getInputProps()} />
          </div>
          {errorMessage && <p className="text-destructive pt-2 font-medium">{errorMessage}</p>}
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
