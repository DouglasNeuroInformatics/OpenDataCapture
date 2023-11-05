import { ClientTable } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { AssignmentStatus, AssignmentSummary } from '@open-data-capture/common/assignment';
import type { Language } from '@open-data-capture/common/core';
import { useTranslation } from 'react-i18next';

export type AssignmentTableProps = {
  assignments: AssignmentSummary[];
  onSelection: (assignment: AssignmentSummary) => void;
};

export const AssignmentsTable = ({ assignments, onSelection }: AssignmentTableProps) => {
  const { i18n, t } = useTranslation('subjects');
  return (
    <ClientTable<AssignmentSummary>
      columns={[
        {
          field: (entry) => {
            const altLanguage = i18n.resolvedLanguage === 'en' ? 'fr' : 'en';
            const title = entry.instrument.details.title;
            if (typeof title === 'string') {
              return title;
            }
            return title[i18n.resolvedLanguage as Language] ?? title[altLanguage];
          },
          label: t('assignments.title')
        },
        {
          field: 'assignedAt',
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
