import React, { useState } from 'react';

import { serializeError } from '@douglasneuroinformatics/libjs';
import { Button, FileDropzone, Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { createFileRoute } from '@tanstack/react-router';
import { BadgeHelpIcon, DownloadIcon } from 'lucide-react';
import z from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { useInstrument } from '@/hooks/useInstrument';
import { useUploadInstrumentRecordsMutation } from '@/hooks/useUploadInstrumentRecordsMutation';
import { useAppStore } from '@/store';
import { createUploadTemplateCSV, processInstrumentCSV, reformatInstrumentData, UploadError } from '@/utils/upload';

const RouteComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const uploadInstrumentRecordsMutation = useUploadInstrumentRecordsMutation();

  const params = Route.useParams();
  const { error } = Route.useSearch();
  const navigate = Route.useNavigate();

  const instrument = useInstrument(params.instrumentId) as (AnyUnilingualFormInstrument & { id: string }) | null;
  const { t } = useTranslation();

  const handleTemplateDownload = () => {
    try {
      const { content, filename } = createUploadTemplateCSV(instrument!);
      void download(filename, content);
    } catch (error) {
      console.error(error);
      void navigate({
        search: {
          error: {
            description: error instanceof UploadError ? error.description : undefined,
            title: {
              en: `Error Occurred Downloading Sample Template`,
              fr: `Une erreur s'est produite lors du téléchargement du CSV`
            }
          }
        },
        to: '.'
      });
    }
  };

  const handleInstrumentCSV = async () => {
    try {
      setIsLoading(true);
      const processedDataResult = await processInstrumentCSV(file!, instrument!);
      const reformattedData = reformatInstrumentData({
        currentGroup,
        data: processedDataResult,
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
      setFile(null);
    } catch (error) {
      console.error(error);
      void navigate({
        search: {
          error: {
            description: error instanceof UploadError ? error.description : undefined,
            title: {
              en: `An error has happened within the request`,
              fr: `Une erreur s'est produite lors du téléversement`
            }
          }
        },
        to: '.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-1 p-3 text-center">
        <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t(error.title)}</h3>
        {error.description && (
          <p className="text-muted-foreground mt-2 max-w-prose text-sm sm:text-base">{t(error.description)}</p>
        )}
        <div className="mt-6 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void download('error.json', JSON.stringify(serializeError(error), null, 2));
            }}
          >
            {t({
              en: 'Error Report',
              fr: "Rapport d'erreur"
            })}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              void navigate({ to: '.' });
            }}
          >
            {t({
              en: 'Try Again',
              fr: 'Réessayer'
            })}
          </Button>
        </div>
      </div>
    );
  }

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
  component: RouteComponent,
  validateSearch: z.object({
    error: z
      .object({
        description: z
          .object({
            en: z.string(),
            fr: z.string()
          })
          .partial()
          .optional(),
        title: z.object({
          en: z.string(),
          fr: z.string()
        })
      })
      .optional()
  })
});
