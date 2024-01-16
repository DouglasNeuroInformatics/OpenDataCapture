import { useEffect, useState } from 'react';

import { ClientTable } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Assignment, AssignmentStatus } from '@open-data-capture/common/assignment';
import type { Language } from '@open-data-capture/common/core';
import { type Instrument } from '@open-data-capture/common/instrument';
import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

const interpreter = new InstrumentInterpreter();

export type AssignmentTableProps = {
  assignments: Assignment[];
  onSelection: (assignment: Assignment) => void;
};

export const AssignmentsTable = ({ assignments, onSelection }: AssignmentTableProps) => {
  const { i18n, t } = useTranslation('subjects');
  const [instruments, setInstruments] = useState<Record<string, Instrument>>({});

  // To be moved to backend
  const evaluateInstruments = async (assignments: Assignment[]) => {
    const instruments: Record<string, Instrument> = {};
    const uniqueAssignments = _.uniqWith(assignments, (a, b) => a.id === b.id);
    for (const assignment of uniqueAssignments) {
      instruments[assignment.id] = await interpreter.interpret(assignment.instrumentBundle, {
        validate: import.meta.env.DEV
      });
    }
    return instruments;
  };

  useEffect(() => {
    evaluateInstruments(assignments).then(setInstruments).catch(console.error);
  }, [assignments]);

  return (
    <ClientTable<Assignment>
      columns={[
        {
          field: (entry) => {
            const altLanguage = i18n.resolvedLanguage === 'en' ? 'fr' : 'en';
            const title = instruments[entry.instrumentId]?.details.title;
            if (typeof title === 'string') {
              return title;
            }
            return title?.[i18n.resolvedLanguage as Language] ?? title?.[altLanguage] ?? entry.instrumentId;
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
