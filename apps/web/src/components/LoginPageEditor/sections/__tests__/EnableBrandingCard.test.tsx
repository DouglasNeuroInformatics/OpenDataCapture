import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBrandingForm } from '../../hooks';
import { EnableBrandingCard } from '../EnableBrandingCard';

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

const EditedEnableBrandingCard = () => <EnableBrandingCard editor={useBrandingForm()} />;

const getEnableCheckbox = () => screen.getByRole('checkbox', { name: 'Enable' });

describe('EnableBrandingCard', () => {
  beforeEach(() => {
    mocks.branding = null;
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should leave the custom login page off when nothing is saved, so the classic page stays the default', () => {
    render(<EditedEnableBrandingCard />);
    expect(getEnableCheckbox().getAttribute('aria-checked')).toBe('false');
  });

  it('should reflect a saved enabled branding', () => {
    mocks.branding = { enableBranding: true };
    render(<EditedEnableBrandingCard />);
    expect(getEnableCheckbox().getAttribute('aria-checked')).toBe('true');
  });

  it('should enable the custom login page when checked', () => {
    render(<EditedEnableBrandingCard />);
    fireEvent.click(getEnableCheckbox());
    expect(getEnableCheckbox().getAttribute('aria-checked')).toBe('true');
  });

  it('should disable the custom login page when unchecked', () => {
    mocks.branding = { enableBranding: true };
    render(<EditedEnableBrandingCard />);
    fireEvent.click(getEnableCheckbox());
    expect(getEnableCheckbox().getAttribute('aria-checked')).toBe('false');
  });

  it('should toggle from its label too, so the whole row is a click target', () => {
    render(<EditedEnableBrandingCard />);
    fireEvent.click(screen.getByText('Enable'));
    expect(getEnableCheckbox().getAttribute('aria-checked')).toBe('true');
  });
});
