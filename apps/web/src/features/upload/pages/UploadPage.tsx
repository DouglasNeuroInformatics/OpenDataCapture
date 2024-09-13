import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useInstrument } from '@/hooks/useInstrument';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const params = useParams();
  const instrument = useInstrument(params.id as string);

  const handleTemplateDownload = () => {
    if (!instrument) {
      return;
    }
    const parsedInstrument = JSON.parse(JSON.stringify(instrument.content));
    let kindsArray: string[] = [];
    for (let key in parsedInstrument) {
      kindsArray.push(parsedInstrument[key]['kind']);
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
        <Button variant={'primary'} onClick={processInstrumentCSV}>
          Submit
        </Button>
        <Button variant={'primary'} onClick={handleTemplateDownload}>
          <DownloadIcon />
          Download Template
        </Button>
      </div>
    </div>
  );
};
