import { useEffect, useState } from 'react';

import { ClientTable } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Assignment, AssignmentStatus } from '@open-data-capture/common/assignment';
import type { UnilingualInstrumentSummary } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';

import { useInstrumentSummariesQuery } from '@/hooks/useInstrumentSummariesQuery';

export type AssignmentTableProps = {
  assignments: Assignment[];
  onSelection: (assignment: Assignment) => void;
};

export const AssignmentsTable = ({ assignments, onSelection }: AssignmentTableProps) => {
  const { t } = useTranslation('subjects');
  const [instrumentSummaries, setInstrumentSummaries] = useState<Record<string, UnilingualInstrumentSummary>>({});

  const instrumentSummariesQuery = useInstrumentSummariesQuery();

  useEffect(() => {
    setInstrumentSummaries(Object.fromEntries(instrumentSummariesQuery.data.map((summary) => [summary.id, summary])));
  }, [instrumentSummariesQuery.data]);

  return (
    <ClientTable<Assignment>
      columns={[
        {
          field: (entry) => {
            return instrumentSummaries[entry.instrumentId]?.details.title ?? entry.instrumentId;
          },
          label: t('assignments.title')
        },
        {
          field: 'createdAt',
          formatter: (value: Date) => toBasicISOString(value),
          label: t('assignments.assignedAt')
        },
        {
          field: 'expiresAt',
          formatter: (value: Date) => toBasicISOString(value),
          label: t('assignments.expiresAt')
        },
        {
          field: 'status',
          formatter: (value: AssignmentStatus) => {
            switch (value) {
              case 'CANCELED':
                return t('assignments.statusOptions.canceled');
              case 'COMPLETE':
                return t('assignments.statusOptions.complete');
              case 'EXPIRED':
                return t('assignments.statusOptions.expired');
              case 'OUTSTANDING':
                return t('assignments.statusOptions.outstanding');
            }
          },
          label: t('assignments.status')
        }
      ]}
      data={assignments}
      minRows={10}
      onEntryClick={onSelection}
    />
  );
};
