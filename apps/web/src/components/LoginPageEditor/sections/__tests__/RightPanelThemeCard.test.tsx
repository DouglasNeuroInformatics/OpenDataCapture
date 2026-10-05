import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOGIN_THEME_COLORS } from '@/utils/branding';

import { RIGHT_PANEL_LABELS, RIGHT_PANEL_OPTIONS } from '../../constants';
import { useBrandingForm } from '../../hooks';
import { RightPanelThemeCard } from '../RightPanelThemeCard';

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

const EditedRightPanelThemeCard = () => <RightPanelThemeCard editor={useBrandingForm()} />;

const getSwatch = (label: string) => screen.getByRole('button', { name: label });

const isSelected = (label: string) => getSwatch(label).classList.contains('ring-2');

const swatchGradient = (label: string) => getSwatch(label).querySelector('span')!.style.backgroundImage;

const CUSTOM_RIGHT_PANEL: BrandingConfig = {
  rightPanelPrimaryColor: '#123456',
  rightPanelSecondaryColor: '#abcdef',
  rightPanelTheme: 'custom'
};

describe('RightPanelThemeCard', () => {
  beforeEach(() => {
    mocks.branding = null;
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should offer one swatch per right-panel option', () => {
    render(<EditedRightPanelThemeCard />);
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(
      RIGHT_PANEL_OPTIONS.map((option) => RIGHT_PANEL_LABELS[option].en)
    );
  });

  it('should select the default option when nothing is saved, so the login form keeps its plain background', () => {
    render(<EditedRightPanelThemeCard />);
    expect([isSelected('Default'), isSelected('Slate')]).toEqual([true, false]);
  });

  it('should select an option when its swatch is clicked', () => {
    render(<EditedRightPanelThemeCard />);
    fireEvent.click(getSwatch('Ocean'));
    expect([isSelected('Default'), isSelected('Ocean')]).toEqual([false, true]);
  });

  it('should paint the default swatch with stripes, since it applies no gradient', () => {
    render(<EditedRightPanelThemeCard />);
    expect(swatchGradient('Default')).toContain('repeating-linear-gradient');
  });

  it('should paint a preset swatch with its theme gradient', () => {
    render(<EditedRightPanelThemeCard />);
    expect(swatchGradient('Violet')).toContain(LOGIN_THEME_COLORS.violet.primary);
  });

  it("should paint the custom swatch with the admin's right-panel colors", () => {
    mocks.branding = CUSTOM_RIGHT_PANEL;
    render(<EditedRightPanelThemeCard />);
    expect(swatchGradient('Custom')).toBe('linear-gradient(135deg, #123456 0%, #abcdef 100%)');
  });

  it('should hide the custom color fields unless the custom option is selected', () => {
    render(<EditedRightPanelThemeCard />);
    expect(screen.queryByLabelText('Gradient Start')).toBeNull();
  });

  it('should reveal the custom color fields prefilled when the custom swatch is chosen', () => {
    mocks.branding = { rightPanelPrimaryColor: '#123456', rightPanelSecondaryColor: '#abcdef' };
    render(<EditedRightPanelThemeCard />);
    fireEvent.click(getSwatch('Custom'));
    expect([
      screen.getByLabelText<HTMLInputElement>('Gradient Start').value,
      screen.getByLabelText<HTMLInputElement>('Gradient End').value
    ]).toEqual(['#123456', '#abcdef']);
  });

  it('should repaint the custom swatch from a typed gradient start', () => {
    mocks.branding = CUSTOM_RIGHT_PANEL;
    render(<EditedRightPanelThemeCard />);
    fireEvent.change(screen.getByLabelText('Gradient Start'), { target: { value: '#ff0000' } });
    expect(swatchGradient('Custom')).toBe('linear-gradient(135deg, #ff0000 0%, #abcdef 100%)');
  });

  it('should repaint the custom swatch from a typed gradient end', () => {
    mocks.branding = CUSTOM_RIGHT_PANEL;
    render(<EditedRightPanelThemeCard />);
    fireEvent.change(screen.getByLabelText('Gradient End'), { target: { value: '#00ff00' } });
    expect(swatchGradient('Custom')).toBe('linear-gradient(135deg, #123456 0%, #00ff00 100%)');
  });
});
