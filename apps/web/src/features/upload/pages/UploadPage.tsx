import { useState } from 'react';

import fs from 'fs';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualScalarInstrument } from '@opendatacapture/runtime-core';
import { DownloadIcon } from 'lucide-react';
import Papa from 'papaparse';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { useInstrument } from '@/hooks/useInstrument';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const download = useDownload();

  const params = useParams();
  const instrument = useInstrument(params.id!) as AnyUnilingualScalarInstrument | null;

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

    const columnNames = Object.keys(instrumentSchema.shape as z.AnyZodObject);

    const csvColumns = 'Mouse ID,Date,' + columnNames.join(',') + '\n';

    const fileName = instrument.details.title + ' template';

    void download(`${fileName}.csv`, () => {
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

  const csvToJson = (csvFilePath: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      // Read the CSV file
      fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }

        // Parse the CSV data using PapaParse
        Papa.parse(data, {
          complete: (result) => {
            resolve(result.data);
          },
          error: (parseError) => {
            reject(parseError);
          },
          header: true, // Use the first row as headers
          skipEmptyLines: true // Skip empty lines
        });
      });
    });
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
