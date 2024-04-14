import React from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { DownloadIcon } from 'lucide-react';

import { useSourceRef } from '@/hooks/useSourceRef';

export const DownloadButton = () => {
  const download = useDownload();
  const sourceRef = useSourceRef();

  return (
    <Button
      className="h-9 w-9"
      size="icon"
      type="button"
      variant="outline"
      onClick={() => {
        void download('instrument.js', () => sourceRef.current);
      }}
    >
      <DownloadIcon />
    </Button>
  );
};
