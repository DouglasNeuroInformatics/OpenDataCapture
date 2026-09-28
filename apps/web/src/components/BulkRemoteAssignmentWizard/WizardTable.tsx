import React from 'react';

import { Table } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';

type WizardTableProps = {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  /** The header cells, rendered inside the one header row. */
  head: React.ReactNode;
};

/**
 * The one table treatment for every step: a single hairline frame around the grid and a muted
 * header row, so the mapping, instrument, review and result tables all read as the same thing.
 */
export const WizardTable = ({ children, className, 'data-testid': testId, head }: WizardTableProps) => (
  <div className={cn('overflow-x-auto rounded-md border', className)} data-testid={testId}>
    <Table>
      <Table.Header className="bg-muted/40">
        <Table.Row>{head}</Table.Row>
      </Table.Header>
      <Table.Body>{children}</Table.Body>
    </Table>
  </div>
);
