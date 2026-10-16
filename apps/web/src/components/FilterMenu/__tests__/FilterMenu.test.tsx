import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FilterMenu } from '@/components/FilterMenu';

import '@/services/i18n';

const options = [
  { label: 'Depression Clinic', value: 'depression-clinic' },
  { label: 'Psychosis Lab', value: 'psychosis-lab' }
] as const;

type Value = (typeof options)[number]['value'];

const renderMenu = (value: undefined | Value, onValueChange = vi.fn()) => {
  render(
    <FilterMenu
      allLabel="All groups"
      data-testid="filter"
      label="Group"
      options={[...options]}
      value={value}
      onValueChange={onValueChange}
    />
  );
  return onValueChange;
};

const openMenu = () => fireEvent.keyDown(screen.getByTestId('filter'), { key: 'Enter' });

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
});

describe('FilterMenu', () => {
  it('should show only the facet name while nothing is selected', () => {
    renderMenu(undefined);
    expect(screen.getByTestId('filter').textContent).toBe('Group');
    expect(screen.getByTestId('filter').dataset.active).toBe('false');
  });

  it('should show the selected option beside the facet name', () => {
    renderMenu('psychosis-lab');
    expect(screen.getByTestId('filter').textContent).toBe('GroupPsychosis Lab');
    expect(screen.getByTestId('filter').dataset.active).toBe('true');
  });

  it('should report the chosen option', () => {
    const onValueChange = renderMenu(undefined);
    openMenu();
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Depression Clinic' }));
    expect(onValueChange).toHaveBeenCalledWith('depression-clinic');
  });

  it('should report undefined when the all option is chosen, so the caller clears the filter', () => {
    const onValueChange = renderMenu('psychosis-lab');
    openMenu();
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'All groups' }));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it('should mark the all option as checked while nothing is selected', () => {
    renderMenu(undefined);
    openMenu();
    expect(screen.getByRole('menuitemradio', { name: 'All groups' }).getAttribute('aria-checked')).toBe('true');
  });
});
