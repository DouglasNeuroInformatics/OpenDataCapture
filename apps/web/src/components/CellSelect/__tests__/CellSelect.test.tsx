import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CellSelect } from '@/components/CellSelect/CellSelect';

import '@/services/i18n';

const onValueChange = vi.fn();

const renderSelect = (value?: string) => {
  render(
    <CellSelect
      label="Action"
      name="action"
      options={{ create: 'Create', read: 'Read' }}
      placeholder="Choose…"
      value={value}
      onValueChange={onValueChange}
    />
  );
};

describe('CellSelect', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should show the placeholder until a value is chosen', () => {
    renderSelect();
    expect(screen.getByTestId('action-select-trigger').textContent).toBe('Choose…');
  });

  it('should report the option chosen, keyed by its value', () => {
    renderSelect();
    fireEvent.keyDown(screen.getByTestId('action-select-trigger'), { key: 'Enter' });
    fireEvent.click(screen.getByTestId('action-select-item-read'));
    expect(onValueChange).toHaveBeenCalledWith('read');
  });

  it('should name the trigger by its label, since a table cell has no visible one', () => {
    renderSelect('create');
    expect(screen.getByRole('combobox', { name: 'Action' }).textContent).toBe('Create');
  });
});
