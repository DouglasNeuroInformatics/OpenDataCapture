import type React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBrandingForm } from '../../hooks';
import { FullscreenPreviewDialog } from '../FullscreenPreviewDialog';

import '@/services/i18n';

const mocks = vi.hoisted((): { branding: BrandingConfig | null } => ({ branding: null }));

vi.mock('@/config', () => ({
  config: { meta: { docsUrl: 'https://docs.example.org', githubRepoUrl: 'https://github.com/example/odc' } }
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { branding: mocks.branding } })
}));

vi.mock('@/hooks/useUpdateSetupStateMutation', () => ({
  useUpdateSetupStateMutation: () => ({ isPending: false, mutate: vi.fn() })
}));

vi.mock('@tanstack/react-router', () => ({
  useBlocker: () => ({ status: 'idle' })
}));

type FullscreenPreviewDialogHarnessProps = Partial<
  Omit<React.ComponentProps<typeof FullscreenPreviewDialog>, 'editor'>
>;

const FullscreenPreviewDialogHarness = ({
  onOpenChange = vi.fn(),
  open = true,
  previewLang = 'en'
}: FullscreenPreviewDialogHarnessProps) => (
  <FullscreenPreviewDialog
    editor={useBrandingForm()}
    open={open}
    previewLang={previewLang}
    onOpenChange={onOpenChange}
  />
);

const BRANDED: BrandingConfig = {
  enableBranding: true,
  instanceName: { en: 'Acme Clinic', fr: 'Clinique Acme' }
};

const getLoginFormSide = () => screen.getByRole('heading', { name: 'Login' }).closest<HTMLElement>('.overflow-y-auto')!;

const getPreviewDialog = () => screen.getByRole('dialog', { name: 'Login page fullscreen preview' });

describe('FullscreenPreviewDialog', () => {
  beforeEach(() => {
    mocks.branding = null;
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing while closed', () => {
    render(<FullscreenPreviewDialogHarness open={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should open as an accessibly named dialog', () => {
    render(<FullscreenPreviewDialogHarness />);
    expect(getPreviewDialog()).toBeTruthy();
  });

  it('should hint the username field in the preview language', () => {
    render(<FullscreenPreviewDialogHarness previewLang="fr" />);
    expect(screen.getByRole<HTMLInputElement>('textbox').placeholder).toBe("Nom d'utilisateur");
  });

  it('should mock the login form in English', () => {
    render(<FullscreenPreviewDialogHarness />);
    expect(getLoginFormSide().textContent).toBe('LoginUsernamePasswordLogin');
  });

  it('should mock the login form in French when previewing French', () => {
    render(<FullscreenPreviewDialogHarness previewLang="fr" />);
    const loginFormSide = within(getPreviewDialog())
      .getByRole('heading', { name: 'Se connecter' })
      .closest('.overflow-y-auto');
    expect(loginFormSide?.textContent).toBe("Se connecterNom d'utilisateurMot de passeSe connecter");
  });

  it('should keep the mocked login form inert, so the preview cannot be mistaken for a working login', () => {
    render(<FullscreenPreviewDialogHarness />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Login' }).disabled).toBe(true);
  });

  it('should ask to close when Escape is pressed', () => {
    const onOpenChange = vi.fn();
    render(<FullscreenPreviewDialogHarness onOpenChange={onOpenChange} />);
    fireEvent.keyDown(getPreviewDialog(), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not move focus into the dialog on open, so the preview shows no focus ring', () => {
    render(<FullscreenPreviewDialogHarness />);
    expect(getPreviewDialog().contains(document.activeElement)).toBe(false);
  });

  it('should omit the branding panel and widen the login form when branding is disabled', () => {
    mocks.branding = { ...BRANDED, enableBranding: false, rightPanelTheme: 'ocean' };
    render(<FullscreenPreviewDialogHarness />);
    expect(screen.queryByRole('heading', { name: 'Acme Clinic' })).toBeNull();
    expect([...getLoginFormSide().classList]).toContain('w-full');
  });

  it('should ignore a right-panel theme while branding is disabled', () => {
    mocks.branding = { rightPanelTheme: 'ocean' };
    render(<FullscreenPreviewDialogHarness />);
    expect(getLoginFormSide().style.backgroundImage).toBe('');
  });

  it('should show the branding panel in the preview language when branding is enabled', () => {
    mocks.branding = BRANDED;
    render(<FullscreenPreviewDialogHarness previewLang="fr" />);
    expect(screen.getByRole('heading', { name: 'Clinique Acme' })).toBeTruthy();
  });

  it('should split the screen with the branding panel when branding is enabled', () => {
    mocks.branding = BRANDED;
    render(<FullscreenPreviewDialogHarness />);
    expect([...getLoginFormSide().classList]).toContain('w-1/2');
  });

  it('should paint the right-panel gradient behind the login form when branding has one', () => {
    mocks.branding = { ...BRANDED, rightPanelTheme: 'ocean' };
    render(<FullscreenPreviewDialogHarness />);
    expect(getLoginFormSide().style.backgroundImage).toContain('linear-gradient');
  });

  it('should leave the login form background plain when branding has no right-panel theme', () => {
    mocks.branding = BRANDED;
    render(<FullscreenPreviewDialogHarness />);
    expect(getLoginFormSide().style.backgroundImage).toBe('');
  });
});
