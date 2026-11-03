import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SelectTableColorMode } from '../SelectTableColorMode';

import '@/services/i18n';

const trigger = () => screen.getByTestId('table-color-mode-select');

const open = () => fireEvent.keyDown(trigger(), { key: 'Enter' });

const option = (mode: string) => screen.getByTestId(`table-color-mode-option-${mode}`);

describe('SelectTableColorMode', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('should show the selected mode on the closed control', () => {
    render(<SelectTableColorMode value="text" onSelect={vi.fn()} />);
    expect(trigger().textContent).toContain('Colored text');
  });

  it('should offer every mode with the default first', () => {
    render(<SelectTableColorMode value="tags" onSelect={vi.fn()} />);
    open();
    expect(screen.getAllByRole('option').map((item) => item.getAttribute('data-testid'))).toStrictEqual([
      'table-color-mode-option-tags',
      'table-color-mode-option-text',
      'table-color-mode-option-none'
    ]);
  });

  it('should draw dots only in the tags example, so each option previews its own mode', () => {
    render(<SelectTableColorMode value="tags" onSelect={vi.fn()} />);
    open();
    const dots = (mode: string) => within(option(mode)).queryAllByTestId('color-tag-dot');
    expect(dots('tags')).toHaveLength(2);
    expect(dots('text')).toHaveLength(0);
    expect(dots('none')).toHaveLength(0);
  });

  it('should tint the labels only in the text example, so each option previews its own mode', () => {
    render(<SelectTableColorMode value="tags" onSelect={vi.fn()} />);
    open();
    const tinted = (mode: string) => {
      return within(option(mode))
        .getAllByTestId('color-tag-label')
        .filter((label) => label.style.color).length;
    };
    expect([tinted('tags'), tinted('text'), tinted('none')]).toStrictEqual([0, 2, 0]);
  });

  it('should report the chosen mode', () => {
    const onSelect = vi.fn();
    render(<SelectTableColorMode value="tags" onSelect={onSelect} />);
    open();
    fireEvent.click(option('none'));
    expect(onSelect).toHaveBeenCalledWith('none');
  });
});
