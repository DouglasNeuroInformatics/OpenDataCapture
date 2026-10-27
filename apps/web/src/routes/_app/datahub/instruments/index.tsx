import React, { useMemo } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { InstrumentTable } from '@/components/InstrumentTable';
import type { InstrumentRow } from '@/components/InstrumentTable';
import { PageHeader } from '@/components/PageHeader';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import {
  instrumentRecordSummaryQueryOptions,
  useInstrumentRecordSummaryQuery
} from '@/hooks/useInstrumentRecordSummaryQuery';
import { useAppStore } from '@/store';

const RouteComponent = () => {
  const navigate = useNavigate();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation();

  // Every edition is its own row, so the list shows an instrument's full collection history rather
  // than only its current version.
  const instrumentInfoQuery = useInstrumentInfoQuery({ params: { allEditions: true } });
  const summaryQuery = useInstrumentRecordSummaryQuery({ params: { groupId: currentGroup?.id } });
  // A series holds no records of its own, so its counts come from what it orchestrated.
  const seriesSummaryQuery = useInstrumentRecordSummaryQuery({
    params: { bySeries: true, groupId: currentGroup?.id }
  });

  const data = useMemo<InstrumentRow[]>(() => {
    const summaries = new Map(summaryQuery.data.map((summary) => [summary.instrumentId, summary]));
    const seriesSummaries = new Map(seriesSummaryQuery.data.map((summary) => [summary.instrumentId, summary]));
    return (instrumentInfoQuery.data ?? []).map((info) => {
      const isSeries = info.kind === 'SERIES';
      const summary = (isSeries ? seriesSummaries : summaries).get(info.id);
      return {
        // A series has no `internal`, and therefore no edition to show.
        edition: isSeries ? null : info.internal.edition,
        id: info.id,
        kind: info.kind,
        lastCollectedAt: summary?.lastCollectedAt ?? null,
        recordCount: summary?.recordCount ?? 0,
        source: info.sourceRepo?.name ?? null,
        subjectCount: summary?.subjectCount ?? 0,
        title: info.details.title
      };
    });
  }, [instrumentInfoQuery.data, seriesSummaryQuery.data, summaryQuery.data]);

  const openInstrument = (row: InstrumentRow) => {
    void navigate({ params: { instrumentId: row.id }, to: '/datahub/instruments/$instrumentId/table' });
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Instruments',
            es: 'Instrumentos',
            fr: 'Instruments'
          })}
        </Heading>
      </PageHeader>
      <InstrumentTable data-testid="instrument-hub-table" rows={data} onOpen={openInstrument} />
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/datahub/instruments/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { currentGroup } = useAppStore.getState();
    await Promise.all([
      context.queryClient.ensureQueryData(
        instrumentRecordSummaryQueryOptions({ params: { groupId: currentGroup?.id } })
      ),
      context.queryClient.ensureQueryData(
        instrumentRecordSummaryQueryOptions({ params: { bySeries: true, groupId: currentGroup?.id } })
      )
    ]);
  }
});
