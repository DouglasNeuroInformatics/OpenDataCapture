import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type {
  AnyUnilingualFormInstrument,
  AnyUnilingualScalarInstrument,
  FormTypes
} from '@opendatacapture/runtime-core';
import type { UploadInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';
import axios from 'axios';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { useInstrument } from '@/hooks/useInstrument';

import {
  applyLineTransforms,
  createUploadTemplateCSV,
  getZodTypeName,
  processInstrumentCSV,
  valueInterpreter
} from '../utils';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const params = useParams();
  const instrument = useInstrument(params.id!) as AnyUnilingualFormInstrument;

  const sendInstrumentData = async (data: FormTypes.Data[]) => {
    await axios.post('/v1/instrument-records/upload', data);
    addNotification({ type: 'success' });
  };

  const handleTemplateDownload = () => {
    //to do
    //make sure the first two columns of the csv file are id and date
    //convert the given csv files as a json object
    //parse the json object through the instrument validation schema
    // if succcess full send the data to the backend to be stored
    const { content, fileName } = createUploadTemplateCSV(instrument);
    void download(fileName, content);
  };

  const handleInstrumentCSV = async () => {
    const input = file!;

    const processedData = await processInstrumentCSV(input, instrument);

    if (processedData.success) {
      await sendInstrumentData(processedData.value);
    }
  };

  return (
    <div className="align-center items-center justify-center">
      <FileDropzone file={file} setFile={setFile} />
      <div className="mt-4 flex justify-between space-x-2">
        <Button disabled={!(file && instrument)} variant={'primary'} onClick={handleInstrumentCSV}>
          Submit
        </Button>
        <Button disabled={!instrument} variant={'primary'} onClick={handleTemplateDownload}>
          <DownloadIcon />
          Download Template
        </Button>
      </div>
    </div>
  );
};
