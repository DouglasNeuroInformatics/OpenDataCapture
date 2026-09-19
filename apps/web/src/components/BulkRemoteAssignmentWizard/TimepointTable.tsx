import React from 'react';

import { Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { TrashIcon } from 'lucide-react';

import { WizardTable } from './WizardTable';

import type { DraftTimepoint } from './types';

type TimepointTableProps = {
  'data-testid'?: string;
  /** When given, each row ends with a remove button. */
  onRemove?: (timepoint: DraftTimepoint) => void;
  timepoints: DraftTimepoint[];
};

/** The instruments in the batch and when each expires, as the instruments and review steps both list them. */
export const TimepointTable = ({ 'data-testid': testId, onRemove, timepoints }: TimepointTableProps) => {
  const { t } = useTranslation();
  return (
    <WizardTable
      data-testid={testId}
      head={
        <React.Fragment>
          <Table.Head>{t({ en: 'Instrument', fr: 'Instrument' })}</Table.Head>
          <Table.Head>{t({ en: 'Expires On', fr: 'Expire le' })}</Table.Head>
          {onRemove && <Table.Head className="w-12" />}
        </React.Fragment>
      }
    >
      {timepoints.map((timepoint) => (
        <Table.Row key={timepoint.instrumentId}>
          <Table.Cell className="font-medium">{timepoint.instrumentTitle}</Table.Cell>
          <Table.Cell className="text-muted-foreground">{timepoint.expiresAt}</Table.Cell>
          {onRemove && (
            <Table.Cell className="py-2">
              <button
                aria-label={t({ en: 'Remove Instrument', fr: "Retirer l'instrument" })}
                className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
                type="button"
                onClick={() => onRemove(timepoint)}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </Table.Cell>
          )}
        </Table.Row>
      ))}
    </WizardTable>
  );
};
