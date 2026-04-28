import React, { useState } from 'react';

import { serializeError } from '@douglasneuroinformatics/libjs';
import { Button, Checkbox, FileDropzone, Heading, Spinner } from '@douglasneuroinformatics/libui/components';
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
  const [isUploaderChecked, setIsUploaderChecked] = useState(false);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
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
              fr: `Une erreur s'est produite lors du téléchargement du modèle`
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
        currentUsername: isUploaderChecked ? currentUser?.username : undefined,
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
        <div className="mx-auto flex w-full max-w-3xl grow flex-col justify-center gap-6">
          <div className="space-y-4">
            <FileDropzone
              acceptedFileTypes={{ 'text/csv': ['.csv'] }}
              className="flex h-80 w-full flex-col"
              file={file}
              setFile={setFile}
            />
            <div className="bg-muted/30 border-muted rounded-lg border p-3 transition-colors">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isUploaderChecked}
                  id="attach-uploader"
                  onCheckedChange={(checked) => setIsUploaderChecked(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label className="cursor-pointer text-sm font-semibold tracking-tight" htmlFor="attach-uploader">
                    {t({
                      en: 'Include uploader username',
                      fr: "Inclure le nom d'utilisateur du téléverseur"
                    })}
                  </label>
                  <p className="text-muted-foreground text-xs">
                    {t({
                      en: 'Your username will be associated with these records for audit and traceability.',
                      fr: 'Votre nom d’utilisateur sera associé à ces entrées pour l’audit et la traçabilité.'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button disabled={!(file && instrument)} variant="primary" onClick={() => void handleInstrumentCSV()}>
              {t('core.submit')}
            </Button>

            <div className="flex gap-2">
              <Button className="gap-2" size="sm" variant="outline" onClick={handleTemplateDownload}>
                <DownloadIcon size={16} />
                {t({ en: 'Template', fr: 'Modèle' })}
              </Button>
              <Button
                className="gap-2"
                size="sm"
                variant="outline"
                onClick={() => window.open('https://opendatacapture.org/en/docs/guides/how-to-upload-data/')}
              >
                <BadgeHelpIcon size={16} />
                {t({ en: 'Help', fr: 'Aide' })}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl grow flex-col justify-center">
          <Spinner className="mx-auto size-24" />
          <Heading className="mt-4 text-center" variant="h3">
            {t({
              en: 'Data currently uploading...',
              fr: 'Données en cours de téléversement...'
            })}
          </Heading>
        </div>
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
