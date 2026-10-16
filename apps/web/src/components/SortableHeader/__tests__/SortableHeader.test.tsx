import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SortableHeader } from '@/components/SortableHeader';

type Row = { id: string };

const columnOf = (sorted: 'asc' | 'desc' | false, toggleSorting = vi.fn()) =>
  ({ getIsSorted: () => sorted, toggleSorting }) as never;

describe('SortableHeader', () => {
  it('should render the column label', () => {
    render(<SortableHeader<Row> column={columnOf(false)} label="Instrument" />);
    expect(screen.getByRole('button', { name: /Instrument/u })).toBeTruthy();
  });

  it('should ask the column to toggle its sort when clicked', () => {
    const toggleSorting = vi.fn();
    render(<SortableHeader<Row> column={columnOf(false, toggleSorting)} label="Records" />);

    fireEvent.click(screen.getByRole('button', { name: /Records/u }));

    expect(toggleSorting).toHaveBeenCalledTimes(1);
  });

  // The icon is the only thing distinguishing the three states, so it has to change with them.
  it('should show a distinct icon for unsorted, ascending and descending', () => {
    const iconOf = (sorted: 'asc' | 'desc' | false) => {
      const { container, unmount } = render(<SortableHeader<Row> column={columnOf(sorted)} label="Subjects" />);
      const path = container.querySelector('svg')?.innerHTML ?? '';
      unmount();
      return path;
    };

    const [unsorted, ascending, descending] = [iconOf(false), iconOf('asc'), iconOf('desc')];
    expect(new Set([ascending, descending, unsorted]).size).toBe(3);
  });

  // Dimming is what tells a user which column the table is actually ordered by.
  it('should dim the icon only while the column is unsorted', () => {
    const { container: unsorted } = render(<SortableHeader<Row> column={columnOf(false)} label="A" />);
    expect(unsorted.querySelector('svg')?.getAttribute('class')).toContain('opacity-40');

    const { container: sorted } = render(<SortableHeader<Row> column={columnOf('asc')} label="B" />);
    expect(sorted.querySelector('svg')?.getAttribute('class')).not.toContain('opacity-40');
  });
});
