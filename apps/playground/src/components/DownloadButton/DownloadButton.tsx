import React from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { DownloadIcon } from 'lucide-react';

import { useEditorStore } from '@/store/editor.store';

export const DownloadButton = () => {
  const download = useDownload();
  const source = useEditorStore((store) => store.source);

  return (
    <Button
      className="h-9 w-9"
      disabled={!source}
      size="icon"
      type="button"
      variant="outline"
      onClick={() => {
        void download('instrument.js', () => source);
      }}
    >
      <DownloadIcon />
    </Button>
  );
};
