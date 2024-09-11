import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { DownloadIcon } from 'lucide-react';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleTemplateDownload = async () => {
    if (!file) {
      return;
    }
  };

  return (
    <div className="align-center items-center justify-center">
      <FileDropzone file={file} setFile={setFile} />
      <div className="mt-4 flex justify-between space-x-2">
        <Button variant={'primary'}>Submit</Button>
        <Button variant={'primary'}>
          <span className="p-1">
            <DownloadIcon />
          </span>
          Download Template
        </Button>
      </div>
    </div>
  );
};
