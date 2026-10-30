import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SectionTabs } from '../SectionTabs';

import '@/services/i18n';

const tabs = [
  { label: 'Repositories', value: 'REPOSITORIES' },
  { label: 'Activity Log', value: 'ACTIVITY' }
] as const;

describe('SectionTabs', () => {
  afterEach(cleanup);

  it('should mark only the current section as active', () => {
    render(<SectionTabs data-testid="tabs" tabs={tabs} value="ACTIVITY" onValueChange={vi.fn()} />);
    expect(screen.getByTestId('tabs-ACTIVITY').dataset.state).toBe('active');
    expect(screen.getByTestId('tabs-REPOSITORIES').dataset.state).toBe('inactive');
  });

  it('should set the labels in bold, so they read as headings for the sections below', () => {
    render(<SectionTabs data-testid="tabs" tabs={tabs} value="ACTIVITY" onValueChange={vi.fn()} />);
    expect(screen.getByTestId('tabs-REPOSITORIES').className).toContain('font-semibold');
  });

  it('should underline the active tab a shade brighter than the primary colour, so it stands out on a tinted card', () => {
    render(<SectionTabs data-testid="tabs" tabs={tabs} value="ACTIVITY" onValueChange={vi.fn()} />);
    expect(screen.getByTestId('tabs-ACTIVITY').className).toContain('dark:data-[state=active]:border-sky-500');
  });

  it('should report the chosen section, so the caller decides what to render', () => {
    const onValueChange = vi.fn();
    render(<SectionTabs data-testid="tabs" tabs={tabs} value="REPOSITORIES" onValueChange={onValueChange} />);

    // Radix tabs activate on mouse down, not click.
    fireEvent.mouseDown(screen.getByTestId('tabs-ACTIVITY'), { button: 0 });

    expect(onValueChange).toHaveBeenCalledWith('ACTIVITY');
  });
});
