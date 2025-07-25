import React, { useState } from 'react';

import { isZodType } from '@douglasneuroinformatics/libjs';
import { Button, FileDropzone, Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { createFileRoute } from '@tanstack/react-router';
import { BadgeHelpIcon, CircleAlertIcon, DownloadIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { useInstrument } from '@/hooks/useInstrument';
import { useUploadInstrumentRecordsMutation } from '@/hooks/useUploadInstrumentRecordsMutation';
import { useAppStore } from '@/store';
import { createUploadTemplateCSV, processInstrumentCSV, reformatInstrumentData } from '@/utils/upload';

const RouteComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const uploadInstrumentRecordsMutation = useUploadInstrumentRecordsMutation();

  const params = Route.useParams();
  const instrument = useInstrument(params.instrumentId) as (AnyUnilingualFormInstrument & { id: string }) | null;
  const { t } = useTranslation();

  const handleTemplateDownload = () => {
    try {
      const { content, fileName } = createUploadTemplateCSV(instrument!);
      void download(fileName, content);
    } catch (error) {
      if (error instanceof Error) {
        addNotification({
          message: t({
            en: `Error occurred downloading sample template with the following message:  ${error.message}`,
            fr: `Un occurence d'un erreur quand le csv document est telecharger avec la message suivant: ${error.message}`
          }),
          type: 'error'
        });
      } else {
        addNotification({
          message: t({
            en: `Error occurred downloading sample template.`,
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
            en: `An error has happened within the request: '${error.message}'`,
            fr: `Une erreur s'est produite lors du téléversement :'${error.message}'.`
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
        isZodType(instrument.validationSchema, { version: 4 }) ? (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-red-300 p-4 dark:bg-red-800">
            <CircleAlertIcon style={{ height: '20px', strokeWidth: '2px', width: '20px' }} />
            <h5 className="font-medium tracking-tight">
              {t({
                en: 'Upload is Not Supported for Zod v4 Instruments',
                fr: "Le téléchargement n'est pas pris en charge pour les instruments utilisant Zod v4"
              })}
            </h5>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl grow flex-col justify-center">
            <FileDropzone
              acceptedFileTypes={{
                'text/csv': ['.csv']
              }}
              className="flex h-80 w-full flex-col"
              file={file}
              setFile={setFile}
            />
            <div className="mt-4 flex justify-between space-x-2">
              <Button disabled={!(file && instrument)} variant={'primary'} onClick={() => void handleInstrumentCSV()}>
                {t('core.submit')}
              </Button>
              <div className="flex justify-between space-x-1">
                <Button className="gap-1" disabled={!instrument} variant={'primary'} onClick={handleTemplateDownload}>
                  <DownloadIcon />
                  {t({
                    en: 'Download Template',
                    fr: 'Télécharger le modèle'
                  })}
                </Button>
                <Button
                  className="gap-1"
                  disabled={!instrument}
                  variant={'primary'}
                  onClick={() => {
                    window.open('https://opendatacapture.org/en/docs/guides/how-to-upload-data/');
                  }}
                >
                  <BadgeHelpIcon />
                  {t({
                    en: 'Help',
                    fr: 'Aide'
                  })}
                </Button>
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="mx-auto flex w-full max-w-3xl grow flex-col justify-center">
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

export const Route = createFileRoute('/_app/upload/$instrumentId')({
  component: RouteComponent
});
