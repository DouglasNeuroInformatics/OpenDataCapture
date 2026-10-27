import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHART_PALETTE_THEMES } from '@/utils/chart-palette';

import { SelectChartPalette } from '../SelectChartPalette';

import '@/services/i18n';

const trigger = () => screen.getByTestId<HTMLButtonElement>('select-chart-palette');

const renderSelect = ({ onSelect = vi.fn(), slots = 3 } = {}) => {
  render(<SelectChartPalette data-testid="select-chart-palette" slots={slots} value="default" onSelect={onSelect} />);
  return onSelect;
};

const open = () => fireEvent.keyDown(trigger(), { key: 'Enter' });

const swatchColors = (option: HTMLElement) =>
  [...option.querySelectorAll<HTMLElement>('span[style]')].map((dot) => dot.style.backgroundColor);

describe('SelectChartPalette', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('should show the name of the selected palette', () => {
    renderSelect();
    expect(trigger().textContent).toContain('Default');
  });

  // `default` is pinned first so the control opens on the palette a chart is drawn with by default.
  it('should offer every palette with the default first', () => {
    renderSelect();
    open();
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toStrictEqual([
      'Default',
      'Berry',
      'Jade',
      'Ember'
    ]);
  });

  it('should report the chosen palette', () => {
    const onSelect = renderSelect();
    open();
    fireEvent.click(screen.getByRole('option', { name: 'Jade' }));
    expect(onSelect).toHaveBeenCalledWith('jade');
  });

  // Naming a palette says nothing about what it looks like, so the hues are shown beside the name.
  it('should preview the hues a palette would draw with', () => {
    renderSelect();
    open();
    expect(swatchColors(screen.getByRole('option', { name: 'Berry' }))).toStrictEqual(
      CHART_PALETTE_THEMES.berry.light.slice(0, 3)
    );
  });

  // The swatch would otherwise promise hues the chart never reaches.
  it('should preview only as many hues as the chart will actually draw with', () => {
    renderSelect({ slots: 2 });
    open();
    expect(swatchColors(screen.getByRole('option', { name: 'Berry' }))).toHaveLength(2);
  });

  it('should preview the dark hues on a dark page, which are re-stepped rather than inverted', () => {
    window.localStorage.setItem('theme', 'dark');
    renderSelect({ slots: 1 });
    open();
    expect(swatchColors(screen.getByRole('option', { name: 'Berry' }))).toStrictEqual([
      CHART_PALETTE_THEMES.berry.dark[0]
    ]);
  });
});
