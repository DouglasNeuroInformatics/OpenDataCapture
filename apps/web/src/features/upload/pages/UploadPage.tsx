import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrument } from '@/hooks/useInstrument';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);

  const params = useParams();

  if (typeof params.id === 'string') {
    setSelectedInstrumentId(params.id);
  }

  const instrument = useInstrument(selectedInstrumentId);

  const handleTemplateDownload = () => {
    return;
  };

  const processInstrumentCSV = () => {
    if (!file) {
      return;
    }
  };

  return (
    <div className="align-center items-center justify-center">
      <FileDropzone file={file} setFile={setFile} />
      <div className="mt-4 flex justify-between space-x-2">
        <Button variant={'primary'}>Submit</Button>
        <Button variant={'primary'} onClick={handleTemplateDownload}>
          <DownloadIcon />
          Download Template
        </Button>
      </div>
    </div>
  );
};
