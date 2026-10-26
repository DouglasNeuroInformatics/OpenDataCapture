import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TimeDropdown } from '@/components/TimeDropdown';

import '@/services/i18n';

const trigger = () => screen.getByTestId<HTMLButtonElement>('time-dropdown-trigger');

const choose = (label: string) => {
  fireEvent.keyDown(trigger(), { key: 'Enter' });
  fireEvent.click(screen.getByRole('option', { name: label }));
};

describe('TimeDropdown', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('should default to all time', () => {
    render(<TimeDropdown onSelect={vi.fn()} />);
    expect(trigger().textContent).toBe('All-Time');
  });

  // The dropdown reports the timeframe rather than a date, so the bound is computed once, where it
  // is used, instead of being carried as a second value that can disagree with the choice.
  it.each([
    ['Past Year', 'pastYear'],
    ['Past Month', 'pastMonth']
  ])('should report %s as its own key', (label, key) => {
    const onSelect = vi.fn();
    render(<TimeDropdown onSelect={onSelect} />);
    choose(label);
    expect(onSelect).toHaveBeenCalledWith(key);
  });

  it('should report all time when it is chosen again, so no record is filtered out', () => {
    const onSelect = vi.fn();
    render(<TimeDropdown onSelect={onSelect} />);
    choose('Past Year');
    choose('All-Time');
    expect(onSelect).toHaveBeenLastCalledWith('all');
  });

  it('should reflect a controlled value so the selection survives a remount', () => {
    render(<TimeDropdown value="pastYear" onSelect={vi.fn()} />);
    expect(trigger().textContent).toBe('Past Year');
  });

  it('should disable the trigger when asked', () => {
    render(<TimeDropdown disabled onSelect={vi.fn()} />);
    expect(trigger().disabled).toBe(true);
  });
});
