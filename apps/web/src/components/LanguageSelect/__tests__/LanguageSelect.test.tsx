import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageSelect } from '../LanguageSelect';

import '@/services/i18n';

const openSelect = () => {
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
};

const optionLabels = () => screen.getAllByRole('option').map((option) => option.textContent);

describe('LanguageSelect', () => {
  beforeEach(() => {
    void i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should show the selected language by its name in the interface language', () => {
    render(<LanguageSelect value="fr" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox').textContent).toBe('French');
  });

  it('should offer every supported language when no options are given', () => {
    render(<LanguageSelect value="en" onChange={vi.fn()} />);
    openSelect();
    expect(optionLabels()).toEqual(['English', 'Spanish', 'French']);
  });

  it('should offer only the given options, so a caller can restrict the choice', () => {
    render(<LanguageSelect options={['en', 'fr']} value="en" onChange={vi.fn()} />);
    openSelect();
    expect(optionLabels()).toEqual(['English', 'French']);
  });

  it('should report the language the user picks', () => {
    const onChange = vi.fn();
    render(<LanguageSelect value="en" onChange={onChange} />);
    openSelect();
    fireEvent.keyDown(screen.getByRole('option', { name: 'Spanish' }), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('es');
  });

  it('should forward the id and test id to the trigger, so a label and the e2e suite can target it', () => {
    render(<LanguageSelect data-testid="language-select" id="language" value="en" onChange={vi.fn()} />);
    expect(screen.getByTestId('language-select').id).toBe('language');
  });
});
