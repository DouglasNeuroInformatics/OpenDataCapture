import React from 'react';

import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import JSZip from 'jszip';
import { DownloadIcon } from 'lucide-react';

import { useEditorFilesRef } from '@/hooks/useEditorFilesRef';
import { isBase64EncodedFileType } from '@/utils/file';

import { ActionButton } from '../ActionButton';

export const DownloadButton = () => {
  const download = useDownload();
  const editorFilesRef = useEditorFilesRef();

  const downloadFiles = async () => {
    const zip = new JSZip();
    const files = editorFilesRef.current;
    for (const file of files) {
      zip.file(file.name, file.content, { base64: isBase64EncodedFileType(file.name) });
    }
    const file = await zip.generateAsync({ type: 'blob' });
    await download('instrument.zip', file, { blobType: 'application/zip' });
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
