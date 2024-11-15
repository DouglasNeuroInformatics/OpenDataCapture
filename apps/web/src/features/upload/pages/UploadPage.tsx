import React, { useState } from 'react';

import { Button, FileDropzone, Heading } from '@douglasneuroinformatics/libui/components';
import { useDownload, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useInstrument } from '@/hooks/useInstrument';
import { useAppStore } from '@/store';

import { useUploadInstrumentRecords } from '../hooks/useUploadInstrumentRecords';
import { createUploadTemplateCSV, processInstrumentCSV, reformatInstrumentData } from '../utils';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const uploadInstrumentRecordsMutation = useUploadInstrumentRecords();

  const params = useParams();
  const instrument = useInstrument(params.id!) as (AnyUnilingualFormInstrument & { id: string }) | null;
  const { t } = useTranslation();

  const handleTemplateDownload = () => {
    const { content, fileName } = createUploadTemplateCSV(instrument!);
    void download(fileName, content);
  };

  const handleInstrumentCSV = async () => {
    const processedDataResult = await processInstrumentCSV(file!, instrument!);
    if (processedDataResult.success) {
      const reformattedData = reformatInstrumentData({
        currentGroup,
        data: processedDataResult.value,
        instrument: instrument!
      });
      uploadInstrumentRecordsMutation.mutate(reformattedData);
    } else {
      addNotification({
        message: processedDataResult.message,
        type: 'error'
      });
    }
    setFile(null);
  };

  if (!instrument) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: `Upload Data For ${instrument.details.title}`,
            fr: `Téléverser les données pour l'instrument : ${instrument.details.title}`
          })}
        </Heading>
      </PageHeader>
      <div className="mx-auto flex w-full max-w-3xl flex-grow flex-col justify-center">
        <FileDropzone
          acceptedFileTypes={{
            'text/csv': ['.csv']
          }}
          className="flex h-80 w-full flex-col"
          file={file}
          setFile={setFile}
        />
        <div className="mt-4 flex justify-between space-x-2">
          <Button disabled={!(file && instrument)} variant={'primary'} onClick={handleInstrumentCSV}>
            {t('core.submit')}
          </Button>
          <Button className="gap-1.5" disabled={!instrument} variant={'primary'} onClick={handleTemplateDownload}>
            <DownloadIcon />
            {t({
              en: 'Download Template',
              fr: 'Télécharger le modèle'
            })}
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};
