import { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ClientTable } from '@douglasneuroinformatics/libui/components';
import type { Assignment, AssignmentStatus } from '@opendatacapture/schemas/assignment';
import type { UnilingualInstrumentSummary } from '@opendatacapture/schemas/instrument';
import { useTranslation } from 'react-i18next';

import { useInstrumentSummariesQuery } from '@/hooks/useInstrumentSummariesQuery';

export type AssignmentTableProps = {
  assignments: Assignment[];
  onSelection: (assignment: Assignment) => void;
};

export const AssignmentsTable = ({ assignments, onSelection }: AssignmentTableProps) => {
  const { t } = useTranslation('subjects');
  const [instrumentSummaries, setInstrumentSummaries] = useState<{ [key: string]: UnilingualInstrumentSummary }>({});

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
