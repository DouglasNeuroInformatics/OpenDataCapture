import React from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { DownloadIcon } from 'lucide-react';

import { useEditorFilesRef } from '@/hooks/useEditorFilesRef';

export const DownloadButton = () => {
  const download = useDownload();
  const editorFilesRef = useEditorFilesRef();

  const downloadFiles = async () => {
    const files = editorFilesRef.current;
    for (const file of files) {
      await download(file.name, () => file.value);
    }
  };

  return (
    <Button
      className="h-9 w-9"
      size="icon"
      type="button"
      variant="outline"
      onClick={() => {
        void downloadFiles();
      }}
    >
      <DownloadIcon />
    </Button>
  );
};
