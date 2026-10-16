import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TimepointTable } from '../TimepointTable';

import type { DraftTimepoint } from '../types';

import '@/services/i18n';

const timepoints: DraftTimepoint[] = [
  { expiresAt: '2030-01-01', instrumentId: 'instrument-1', instrumentTitle: 'Happiness Questionnaire' },
  { expiresAt: '2030-06-01', instrumentId: 'instrument-2', instrumentTitle: 'General Consent Form' }
];

afterEach(cleanup);

describe('TimepointTable', () => {
  it('should list each instrument with its expiry', () => {
    const { container } = render(<TimepointTable timepoints={timepoints} />);
    const rows = container.querySelectorAll('tbody tr');
    expect([...rows].map((row) => row.textContent)).toEqual([
      'Happiness Questionnaire2030-01-01',
      'General Consent Form2030-06-01'
    ]);
  });

  it('should offer no remove buttons when read-only, as on the review step', () => {
    render(<TimepointTable timepoints={timepoints} />);
    expect(screen.queryAllByRole('button', { name: 'Remove Instrument' })).toHaveLength(0);
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  });

  it('should report the timepoint whose remove button was clicked', () => {
    const onRemove = vi.fn();
    render(<TimepointTable timepoints={timepoints} onRemove={onRemove} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove Instrument' })[1]!);
    expect(onRemove).toHaveBeenCalledWith(timepoints[1]);
  });
});
