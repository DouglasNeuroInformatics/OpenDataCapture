import { ClientTable } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { AssignmentSummary, Language } from '@open-data-capture/types';
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
            const title = entry.instrument.details.title;
            if (typeof title === 'string') {
              return title;
            }
            return title[i18n.resolvedLanguage as Language] ?? entry.instrument.name;
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
          formatter: (value: string) => value.charAt(0) + value.slice(1).toLowerCase(),
          label: t('assignments.status')
        }
      ]}
      data={assignments}
      onEntryClick={onSelection}
    />
  );
};
