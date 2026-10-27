import type React from 'react';

type TruncatedCellProps = {
  'data-testid'?: string;
  /** The full value, shown on hover when the cell is too narrow to hold it */
  title: string;
  value: React.ReactNode;
};

/**
 * One line of cell text, clipped with an ellipsis rather than wrapping the row taller.
 *
 * The full value is exposed through the native `title` attribute rather than a tooltip component: a
 * record table renders this in every cell of every row, and a few thousand tooltip roots is a real
 * cost for a hint that is only ever wanted on the one cell a user is pointing at.
 */
export const TruncatedCell = ({ 'data-testid': testId, title, value }: TruncatedCellProps) => (
  <p className="overflow-hidden text-ellipsis whitespace-nowrap" data-testid={testId} title={title}>
    {value}
  </p>
);
