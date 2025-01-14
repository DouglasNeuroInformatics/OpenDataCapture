import React, { useState } from 'react';

import { Button, FileDropzone, Heading, Spinner } from '@douglasneuroinformatics/libui/components';
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
  const [isLoading, setIsLoading] = useState(false);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const uploadInstrumentRecordsMutation = useUploadInstrumentRecords();

  const params = useParams();
  const instrument = useInstrument(params.id!) as (AnyUnilingualFormInstrument & { id: string }) | null;
  const { t } = useTranslation();

  const handleTemplateDownload = () => {
    try {
      const { content, fileName } = createUploadTemplateCSV(instrument!);
      void download(fileName, content);
    } catch (error: unknown) {
      if (error instanceof Error) {
        addNotification({
          message: t({
            en: `Error occurred downloading sample template with the following message:  ${error.message}
            `,
            fr: `Un occurence d'un erreur quand le csv document est telecharger avec la message suivant: ${error.message}`
          }),
          type: 'error'
        });
      } else {
        addNotification({
          message: t({
            en: `Error occurred downloading sample template.
            `,
            fr: `Un occurence d'un erreur quand le csv est telecharger. `
          }),
          type: 'error'
        });
      }
      console.error(error);
    }
  };

  const handleInstrumentCSV = async () => {
    try {
      setIsLoading(true);
      const processedDataResult = await processInstrumentCSV(file!, instrument!);
      if (processedDataResult.success) {
        const reformattedData = reformatInstrumentData({
          currentGroup,
          data: processedDataResult.value,
          instrument: instrument!
        });
        if (reformattedData.records.length > 1000) {
          addNotification({
            message: t({
              en: 'Lots of entries loading, please wait...',
              fr: 'Beaucoup de données, veuillez patienter...'
            }),
            type: 'info'
          });
        }
        await uploadInstrumentRecordsMutation.mutateAsync(reformattedData);
      } else {
        addNotification({
          message: processedDataResult.message,
          type: 'error'
        });
      }
      setFile(null);
    } catch (error) {
      if (error instanceof Error)
        addNotification({
          message: t({
            en: `An error has happended within the request \n '${error.message}'`,
            fr: `Une erreur s'est produite lors du téléversement \n '${error.message}'.`
          }),
          type: 'error'
        });
    } finally {
      setIsLoading(false);
    }
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
      {!isLoading ? (
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
      ) : (
        <>
          <div className="mx-auto flex w-full max-w-3xl flex-grow flex-col justify-center">
            <Spinner className="mx-auto size-1/2"></Spinner>
            <Heading className="text-center" variant="h3">
              {t({
                en: 'Data currently uploading...',
                fr: 'Données en cours de téléchargement...'
              })}
            </Heading>
          </div>
        </>
      )}
    </React.Fragment>
  );
};
