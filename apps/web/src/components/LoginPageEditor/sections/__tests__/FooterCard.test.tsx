import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBrandingForm } from '../../hooks';
import { FooterCard } from '../FooterCard';

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

const EditedFooterCard = () => <FooterCard editor={useBrandingForm()} />;

const getFooterLinksCheckbox = () => screen.getByRole('checkbox', { name: 'Show GitHub and documentation links' });

describe('FooterCard', () => {
  beforeEach(() => {
    mocks.branding = null;
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should show the footer links when nothing is saved, matching the classic login page', () => {
    render(<EditedFooterCard />);
    expect(getFooterLinksCheckbox().getAttribute('aria-checked')).toBe('true');
  });

  it('should reflect saved hidden footer links', () => {
    mocks.branding = { showFooterLinks: false };
    render(<EditedFooterCard />);
    expect(getFooterLinksCheckbox().getAttribute('aria-checked')).toBe('false');
  });

  it('should hide the footer links when unchecked', () => {
    render(<EditedFooterCard />);
    fireEvent.click(getFooterLinksCheckbox());
    expect(getFooterLinksCheckbox().getAttribute('aria-checked')).toBe('false');
  });

  it('should show the footer links again when rechecked', () => {
    mocks.branding = { showFooterLinks: false };
    render(<EditedFooterCard />);
    fireEvent.click(getFooterLinksCheckbox());
    expect(getFooterLinksCheckbox().getAttribute('aria-checked')).toBe('true');
  });
});
