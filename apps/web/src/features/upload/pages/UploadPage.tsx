import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useInstrument } from '@/hooks/useInstrument';
import type { AnyUnilingualScalarInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const download = useDownload();

  const params = useParams();
  const instrument = useInstrument(params.id as string) as AnyUnilingualScalarInstrument | null;

  const handleTemplateDownload = () => {
    //to do
    //make sure the first two columns of the csv file are id and date
    //convert the given csv files as a json object
    //parse the json object through the instrument validation schema
    // if succcess full send the data to the backend to be stored
    if (!instrument) {
      return;
    }

    const instrumentSchema = instrument.validationSchema as z.AnyZodObject;

    const columnNames = Object.keys(instrumentSchema.shape);

    const csvColumns = 'Mouse ID,Date,' + columnNames.join(',') + '\n';

    const fileName = instrument.details.title + ' template';

    void download(`${fileName}.csv`, async () => {
      return csvColumns;
    });

    return;
  };

  const processInstrumentCSV = () => {
    if (!file) {
      return;
    }
    //to do
    //take validation schema types and title to use as column titles
    //make the first two columns of the template csv id and date
    //add the validation schema/content variables as column headers for csv
    //add the first line of the csv to be the data type (string, number, boolean, etc), also say if its optional or not
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
