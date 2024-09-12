import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useInstrument } from '@/hooks/useInstrument';
import { InstrumentSummaryGroup } from 'node_modules/@opendatacapture/instrument-renderer/src/components/InstrumentSummary/InstrumentSummaryGroup';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const params = useParams();
  const instrument = useInstrument(params.id as string);

  const handleTemplateDownload = () => {
    if (!instrument) {
      return;
    }

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
