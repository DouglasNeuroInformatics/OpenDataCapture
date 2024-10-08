import { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Assignment, AssignmentStatus } from '@opendatacapture/schemas/assignment';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';

import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';

export type AssignmentTableProps = {
  assignments: Assignment[];
  onSelection: (assignment: Assignment) => void;
};

export const AssignmentsTable = ({ assignments, onSelection }: AssignmentTableProps) => {
  const { t } = useTranslation('datahub');
  const [instruments, setInstruments] = useState<{ [key: string]: UnilingualInstrumentInfo }>({});

  const instrumentInfoQuery = useInstrumentInfoQuery();

  useEffect(() => {
    setInstruments(
      Object.fromEntries((instrumentInfoQuery.data ?? []).map((instrument) => [instrument.id, instrument]))
    );
  }, [instrumentInfoQuery.data]);

  return (
    <ClientTable<Assignment>
      columns={[
        {
          field: (entry) => {
            return instruments[entry.instrumentId]?.details.title ?? entry.instrumentId;
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
      entriesPerPage={15}
      minRows={15}
      onEntryClick={onSelection}
    />
  );
};
