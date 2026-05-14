import { formatByteSize } from '@douglasneuroinformatics/libjs';
import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentSummary } from '@opendatacapture/react-core';
import type { AnyUnilingualFileInstrument } from '@opendatacapture/runtime-core';
import type { InstrumentRecord } from '@opendatacapture/schemas/instrument-records';
import type { Subject } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import { DownloadIcon } from 'lucide-react';

import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentRecordFilesQuery } from '@/hooks/useInstrumentRecordFilesQuery';
import { instrumentRecordQueryOptions, useInstrumentRecordQuery } from '@/hooks/useInstrumentRecordQuery';
import { subjectQueryOptions, useSubjectQuery } from '@/hooks/useSubjectQuery';

type FileInstrumentRecordViewProps = {
  instrument: AnyUnilingualFileInstrument;
  record: InstrumentRecord;
  subject: Subject;
};

const FileInstrumentRecordView = ({ instrument, record }: FileInstrumentRecordViewProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const notifications = useNotificationsStore();
  const { data: files } = useInstrumentRecordFilesQuery({ params: { id: record.id } });

  const handleDownload = async (file: { name: string; url: string }) => {
    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`Failed to download (${response.status})`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      URL.revokeObjectURL(objectUrl);
      anchor.remove();
    } catch (error) {
      console.error(error);
      notifications.addNotification({
        message: t({
          en: 'An unexpected error occurred',
          fr: "Une erreur inattendue s'est produite"
        }),
        title: 'Error',
        type: 'error'
      });
    }
  };

  const dateCompleted = record.date.toLocaleString(resolvedLanguage, {
    dateStyle: 'long',
    timeStyle: 'long'
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Heading variant="h3">{instrument.details.title}</Heading>
        <p className="text-muted-foreground text-sm">
          {t({
            en: `Completed on ${dateCompleted}`,
            fr: `Remplie le ${dateCompleted}`
          })}
        </p>
      </header>
      {record.pending ? (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">{t({ en: 'Upload pending', fr: 'Téléversement en attente' })}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {instrument.content.fileGroups.map((fileGroup) => {
            const groupFiles = files[fileGroup.basename] ?? [];
            return (
              <section className="space-y-2" key={fileGroup.basename}>
                <Heading variant="h5">{fileGroup.label}</Heading>
                {groupFiles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t({ en: 'No files', fr: 'Aucun fichier' })}</p>
                ) : (
                  <ul className="divide-y rounded-md border">
                    {groupFiles.map((file) => (
                      <li className="flex items-center justify-between gap-4 p-3" key={file.url}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-muted-foreground text-xs">{formatByteSize(file.size)}</p>
                        </div>
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            void handleDownload(file);
                          }}
                        >
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          {t({ en: 'Download', fr: 'Télécharger' })}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RouteComponent = () => {
  const recordId = Route.useParams({ select: (params) => params.recordId });

  const { data: instrumentRecord } = useInstrumentRecordQuery({ params: { id: recordId } });
  const { data: subject } = useSubjectQuery({ params: { id: instrumentRecord.subjectId } });

  const instrument = useInstrument(instrumentRecord.instrumentId);

  if (!instrument) {
    return null;
  }

  return (
    <div className="container py-8">
      {instrument.kind === 'FILE' ? (
        <FileInstrumentRecordView instrument={instrument} record={instrumentRecord} subject={subject} />
      ) : (
        <InstrumentSummary
          displayAllMeasures
          data={instrumentRecord.data}
          instrument={instrument}
          subject={subject}
          timeCollected={instrumentRecord.createdAt.getTime()}
        />
      )}
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/$subjectId/table/$recordId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const record = await context.queryClient.ensureQueryData(
      instrumentRecordQueryOptions({ params: { id: params.recordId } })
    );
    await context.queryClient.ensureQueryData(subjectQueryOptions({ params: { id: record.subjectId } }));
  }
});
