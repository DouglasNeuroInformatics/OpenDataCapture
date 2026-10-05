import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SelectInstrument } from '@/components/SelectInstrument';

import '@/services/i18n';

const OPTIONS = { 'instrument-1': 'Happiness Questionnaire', 'instrument-2': 'Brief Psychiatric Rating Scale' };

const openDropdown = () =>
  fireEvent.keyDown(screen.getByTestId('select-instrument-dropdown-trigger'), { key: 'Enter' });

describe('SelectInstrument', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should prompt for an instrument before one is chosen', () => {
    render(<SelectInstrument options={OPTIONS} onSelect={vi.fn()} />);
    expect(screen.getByTestId('select-instrument-dropdown-trigger').textContent).toBe('Select an instrument');
  });

  it('should offer every instrument by its label', () => {
    render(<SelectInstrument options={OPTIONS} onSelect={vi.fn()} />);
    openDropdown();
    const labels = screen.getAllByTestId('select-instrument-dropdown-item').map((item) => item.textContent);
    expect(labels).toEqual(['Happiness Questionnaire', 'Brief Psychiatric Rating Scale']);
  });

  it('should report the id of the chosen instrument rather than its label', () => {
    const onSelect = vi.fn();
    render(<SelectInstrument options={OPTIONS} onSelect={onSelect} />);
    openDropdown();
    fireEvent.click(screen.getByRole('option', { name: 'Brief Psychiatric Rating Scale' }));
    expect(onSelect).toHaveBeenCalledWith('instrument-2');
  });
});
