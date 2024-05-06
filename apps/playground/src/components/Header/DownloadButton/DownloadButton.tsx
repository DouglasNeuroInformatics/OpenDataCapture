import React from 'react';

import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import JSZip from 'jszip';
import { DownloadIcon } from 'lucide-react';

import { useFilesRef } from '@/hooks/useFilesRef';
import { useAppStore } from '@/store';
import { isBase64EncodedFileType } from '@/utils/file';

import { ActionButton } from '../ActionButton';

export const DownloadButton = () => {
  const download = useDownload();
  const editorFilesRef = useFilesRef();
  const selectedInstrumentLabel = useAppStore((store) => store.selectedInstrument.label);

  const downloadFiles = async () => {
    const zip = new JSZip();
    const files = editorFilesRef.current;
    for (const file of files) {
      zip.file(file.name, file.content, { base64: isBase64EncodedFileType(file.name) });
    }
    const file = await zip.generateAsync({ comment: JSON.stringify({ label: selectedInstrumentLabel }), type: 'blob' });
    const baseName = selectedInstrumentLabel.replaceAll(' ', '-');
    await download(`${baseName}.zip`, file, { blobType: 'application/zip' });
  };

  return (
    <ActionButton
      icon={<DownloadIcon />}
      tooltip="Download Archive"
      onClick={() => {
        void downloadFiles();
      }}
    />
  );
};
