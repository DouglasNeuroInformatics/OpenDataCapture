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
    vi.useFakeTimers({ now: new Date(2026, 2, 15, 12), toFake: ['Date'] });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should default to all time', () => {
    render(<TimeDropdown setMinTime={vi.fn()} />);
    expect(trigger().textContent).toBe('All-Time');
  });

  it('should set the minimum time to one year ago when the past year is chosen', () => {
    const setMinTime = vi.fn();
    render(<TimeDropdown setMinTime={setMinTime} />);
    choose('Past Year');
    expect(setMinTime).toHaveBeenCalledWith(new Date(2025, 2, 15, 12));
  });

  it('should set the minimum time to one month ago when the past month is chosen', () => {
    const setMinTime = vi.fn();
    render(<TimeDropdown setMinTime={setMinTime} />);
    choose('Past Month');
    expect(setMinTime).toHaveBeenCalledWith(new Date(2026, 1, 15, 12));
  });

  it('should clear the minimum time when all time is chosen again, so no record is filtered out', () => {
    const setMinTime = vi.fn();
    render(<TimeDropdown setMinTime={setMinTime} />);
    choose('Past Year');
    choose('All-Time');
    expect(setMinTime).toHaveBeenLastCalledWith(null);
  });

  it('should disable the trigger when asked', () => {
    render(<TimeDropdown disabled setMinTime={vi.fn()} />);
    expect(trigger().disabled).toBe(true);
  });
});
