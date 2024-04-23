import React from 'react';

import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { DownloadIcon } from 'lucide-react';

import { useEditorFilesRef } from '@/hooks/useEditorFilesRef';

import { ActionButton } from '../ActionButton';

export const DownloadButton = () => {
  const download = useDownload();
  const editorFilesRef = useEditorFilesRef();

  const downloadFiles = async () => {
    const files = editorFilesRef.current;
    for (const file of files) {
      await download(file.name, () => file.content);
    }
  };

  return (
    <ActionButton
      icon={<DownloadIcon />}
      tooltip="Download"
      onClick={() => {
        void downloadFiles();
      }}
    />
  );
};
