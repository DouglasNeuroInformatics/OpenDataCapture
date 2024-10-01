import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualFormInstrument, FormTypes, Json } from '@opendatacapture/runtime-core';
import type { UploadInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';
import axios from 'axios';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { useInstrument } from '@/hooks/useInstrument';

import { createUploadTemplateCSV, processInstrumentCSV } from '../utils';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const acceptedFiles = {
    'text/csv': ['.csv']
  };

  const params = useParams();
  const instrument = useInstrument(params.id!) as AnyUnilingualFormInstrument;

  const sendInstrumentData = async (data: FormTypes.Data[]) => {
    const recordsList = [];

    for (const dataInfo of data) {
      const { date: dataDate, subjectID: dataSubjectId, ...restOfData } = dataInfo; // Destructure and extract the rest of the data

      const createdRecord = {
        data: restOfData as Json,
        date: dataDate as Date,
        subjectId: dataSubjectId as string
      };
      recordsList.push(createdRecord);
    }

    const reformatForSending: UploadInstrumentRecordData = {
      groupId: undefined,
      instrumentId: instrument.id!,
      records: recordsList
    };
    try {
      await axios.post('/v1/instrument-records/upload', reformatForSending satisfies UploadInstrumentRecordData);
      addNotification({ type: 'success' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleTemplateDownload = () => {
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
      <FileDropzone acceptedFileTypes={acceptedFiles} file={file} setFile={setFile} />
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
