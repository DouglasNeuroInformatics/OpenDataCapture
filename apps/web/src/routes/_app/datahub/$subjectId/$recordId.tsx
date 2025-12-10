import { InstrumentSummary } from '@opendatacapture/react-core';
import { createFileRoute } from '@tanstack/react-router';

import { useInstrument } from '@/hooks/useInstrument';
import { instrumentRecordQueryOptions, useInstrumentRecordQuery } from '@/hooks/useInstrumentRecordQuery';
import { subjectQueryOptions, useSubjectQuery } from '@/hooks/useSubjectQuery';

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
      <InstrumentSummary
        displayAllMeasures
        data={instrumentRecord.data}
        instrument={instrument}
        subject={subject}
        timeCollected={instrumentRecord.createdAt.getTime()}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/$subjectId/$recordId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const record = await context.queryClient.ensureQueryData(
      instrumentRecordQueryOptions({ params: { id: params.recordId } })
    );
    await context.queryClient.ensureQueryData(subjectQueryOptions({ params: { id: record.subjectId } }));
  }
});
