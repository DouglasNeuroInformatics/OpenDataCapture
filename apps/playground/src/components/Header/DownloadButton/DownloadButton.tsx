import React from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { DownloadIcon } from 'lucide-react';

import { useEditorValueRef } from '@/hooks/useEditorValueRef';

export const DownloadButton = () => {
  const download = useDownload();
  const editorValueRef = useEditorValueRef();

  return (
    <Button
      className="h-9 w-9"
      size="icon"
      type="button"
      variant="outline"
      onClick={() => {
        void download('instrument.js', () => editorValueRef.current);
      }}
    >
      <DownloadIcon />
    </Button>
  );
};
