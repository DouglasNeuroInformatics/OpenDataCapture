import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SelectEdition } from '@/components/SelectEdition';

import '@/services/i18n';

const OPTIONS = { 'edition-1': 'Edition 1', 'edition-2': 'Edition 2' };

const trigger = () => screen.getByTestId<HTMLButtonElement>('select-edition-dropdown-trigger');

describe('SelectEdition', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should show the label of the selected edition', () => {
    render(<SelectEdition options={OPTIONS} value="edition-2" onSelect={vi.fn()} />);
    expect(trigger().textContent).toBe('Edition 2');
  });

  it('should prompt for an edition when none is selected', () => {
    render(<SelectEdition options={OPTIONS} value={null} onSelect={vi.fn()} />);
    expect(trigger().textContent).toBe('Select an edition');
  });

  it('should prompt for an edition when the selected one is not on offer, so a stale id never shows a blank trigger', () => {
    render(<SelectEdition options={OPTIONS} value="edition-from-another-instrument" onSelect={vi.fn()} />);
    expect(trigger().textContent).toBe('Select an edition');
  });

  it('should be disabled when there is only one edition, since there is nothing to choose between', () => {
    render(<SelectEdition options={{ 'edition-1': 'Edition 1' }} value="edition-1" onSelect={vi.fn()} />);
    expect(trigger().disabled).toBe(true);
  });

  it('should be enabled when there are several editions', () => {
    render(<SelectEdition options={OPTIONS} value="edition-1" onSelect={vi.fn()} />);
    expect(trigger().disabled).toBe(false);
  });

  it('should report the id of the chosen edition', () => {
    const onSelect = vi.fn();
    render(<SelectEdition options={OPTIONS} value="edition-1" onSelect={onSelect} />);
    fireEvent.keyDown(trigger(), { key: 'Enter' });
    fireEvent.click(screen.getByRole('option', { name: 'Edition 2' }));
    expect(onSelect).toHaveBeenCalledWith('edition-2');
  });
});
