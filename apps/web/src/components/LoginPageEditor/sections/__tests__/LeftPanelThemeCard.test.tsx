import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { LOGIN_THEMES } from '@opendatacapture/schemas/setup';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOGIN_THEME_COLORS } from '@/utils/branding';

import { THEME_LABELS } from '../../constants';
import { useBrandingForm } from '../../hooks';
import { LeftPanelThemeCard } from '../LeftPanelThemeCard';

import '@/services/i18n';

const mocks = vi.hoisted((): { branding: BrandingConfig | null } => ({ branding: null }));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { branding: mocks.branding } })
}));

vi.mock('@/hooks/useUpdateSetupStateMutation', () => ({
  useUpdateSetupStateMutation: () => ({ isPending: false, mutate: vi.fn() })
}));

vi.mock('@tanstack/react-router', () => ({
  useBlocker: () => ({ status: 'idle' })
}));

const EditedLeftPanelThemeCard = () => <LeftPanelThemeCard editor={useBrandingForm()} />;

const getSwatch = (label: string) => screen.getByRole('button', { name: label });

const isSelected = (label: string) => getSwatch(label).classList.contains('ring-2');

const swatchGradient = (label: string) => getSwatch(label).querySelector('span')!.style.backgroundImage;

describe('LeftPanelThemeCard', () => {
  beforeEach(() => {
    mocks.branding = null;
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should offer one swatch per login theme', () => {
    render(<EditedLeftPanelThemeCard />);
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(
      LOGIN_THEMES.map((theme) => THEME_LABELS[theme].en)
    );
  });

  it('should select the slate theme when nothing is saved, since it is the default', () => {
    render(<EditedLeftPanelThemeCard />);
    expect([isSelected('Slate'), isSelected('Ocean')]).toEqual([true, false]);
  });

  it('should select a theme when its swatch is clicked', () => {
    render(<EditedLeftPanelThemeCard />);
    fireEvent.click(getSwatch('Ocean'));
    expect([isSelected('Slate'), isSelected('Ocean')]).toEqual([false, true]);
  });

  it('should paint a preset swatch with its theme gradient, so the admin sees what they are picking', () => {
    render(<EditedLeftPanelThemeCard />);
    expect(swatchGradient('Forest')).toContain(LOGIN_THEME_COLORS.forest.primary);
  });

  it("should paint the custom swatch with the admin's custom colors", () => {
    mocks.branding = { customPrimaryColor: '#123456', customSecondaryColor: '#abcdef' };
    render(<EditedLeftPanelThemeCard />);
    expect(swatchGradient('Custom')).toBe('linear-gradient(135deg, #123456 0%, #abcdef 100%)');
  });

  it('should hide the custom color fields unless the custom theme is selected', () => {
    render(<EditedLeftPanelThemeCard />);
    expect(screen.queryByLabelText('Gradient Start')).toBeNull();
  });

  it('should reveal the custom color fields prefilled when the custom swatch is chosen', () => {
    mocks.branding = { customPrimaryColor: '#123456', customSecondaryColor: '#abcdef' };
    render(<EditedLeftPanelThemeCard />);
    fireEvent.click(getSwatch('Custom'));
    expect([
      screen.getByLabelText<HTMLInputElement>('Gradient Start').value,
      screen.getByLabelText<HTMLInputElement>('Gradient End').value
    ]).toEqual(['#123456', '#abcdef']);
  });

  it('should repaint the custom swatch from a typed gradient start', () => {
    mocks.branding = { customPrimaryColor: '#123456', customSecondaryColor: '#abcdef', loginTheme: 'custom' };
    render(<EditedLeftPanelThemeCard />);
    fireEvent.change(screen.getByLabelText('Gradient Start'), { target: { value: '#ff0000' } });
    expect(swatchGradient('Custom')).toBe('linear-gradient(135deg, #ff0000 0%, #abcdef 100%)');
  });

  it('should repaint the custom swatch from a typed gradient end', () => {
    mocks.branding = { customPrimaryColor: '#123456', customSecondaryColor: '#abcdef', loginTheme: 'custom' };
    render(<EditedLeftPanelThemeCard />);
    fireEvent.change(screen.getByLabelText('Gradient End'), { target: { value: '#00ff00' } });
    expect(swatchGradient('Custom')).toBe('linear-gradient(135deg, #123456 0%, #00ff00 100%)');
  });
});
