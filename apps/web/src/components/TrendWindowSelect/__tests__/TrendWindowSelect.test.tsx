import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TrendWindowSelect } from '../TrendWindowSelect';

import '@/services/i18n';

const trigger = () => screen.getByTestId('trend-window');

const open = () => fireEvent.keyDown(trigger(), { key: 'Enter' });

describe('TrendWindowSelect', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('should label the default window as the default', () => {
    render(<TrendWindowSelect data-testid="trend-window" value="default" onChange={vi.fn()} />);
    expect(trigger().textContent).toBe('Default');
  });

  it('should offer every window, shortest first after the default', () => {
    render(<TrendWindowSelect data-testid="trend-window" value="default" onChange={vi.fn()} />);
    open();
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Default',
      'Last Month',
      'Last 3 Months',
      'Last 6 Months',
      'Last Year',
      'Last 2 Years',
      'Last 5 Years',
      'All Time'
    ]);
  });

  it('should report the chosen window by its key', () => {
    const onChange = vi.fn();
    render(<TrendWindowSelect data-testid="trend-window" value="default" onChange={onChange} />);
    open();
    fireEvent.click(screen.getByRole('option', { name: 'Last 2 Years' }));
    expect(onChange).toHaveBeenCalledWith('past2Years');
  });

  it('should label its options in the interface language', () => {
    i18n.changeLanguage('fr');
    render(<TrendWindowSelect data-testid="trend-window" value="all" onChange={vi.fn()} />);
    expect(trigger().textContent).toBe('Depuis le début');
  });
});
