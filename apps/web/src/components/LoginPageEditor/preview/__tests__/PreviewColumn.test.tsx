import type React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FORM_ID } from '../../constants';
import { useBrandingForm } from '../../hooks';
import { PreviewColumn } from '../PreviewColumn';

import '@/services/i18n';

const mocks = vi.hoisted((): { branding: BrandingConfig | null; isPending: boolean } => ({
  branding: null,
  isPending: false
}));

vi.mock('@/config', () => ({
  config: { meta: { docsUrl: 'https://docs.example.org', githubRepoUrl: 'https://github.com/example/odc' } }
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { branding: mocks.branding } })
}));

vi.mock('@/hooks/useUpdateSetupStateMutation', () => ({
  useUpdateSetupStateMutation: () => ({ isPending: mocks.isPending, mutate: vi.fn() })
}));

vi.mock('@tanstack/react-router', () => ({
  useBlocker: () => ({ status: 'idle' })
}));

type PreviewColumnHarnessProps = Partial<Omit<React.ComponentProps<typeof PreviewColumn>, 'editor'>>;

const PreviewColumnHarness = ({
  onOpenFullscreen = vi.fn(),
  onPreviewLangChange = vi.fn(),
  previewLang = 'en'
}: PreviewColumnHarnessProps) => (
  <PreviewColumn
    editor={useBrandingForm()}
    previewLang={previewLang}
    onOpenFullscreen={onOpenFullscreen}
    onPreviewLangChange={onPreviewLangChange}
  />
);

const BRANDED: BrandingConfig = {
  enableBranding: true,
  instanceName: { en: 'Acme Clinic', fr: 'Clinique Acme' }
};

const getLoginFormMock = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.aspect-4\\/3 > div:last-child')!;

describe('PreviewColumn', () => {
  beforeEach(() => {
    mocks.branding = null;
    mocks.isPending = false;
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should request the fullscreen preview when its button is clicked', () => {
    const onOpenFullscreen = vi.fn();
    render(<PreviewColumnHarness onOpenFullscreen={onOpenFullscreen} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fullscreen preview' }));
    expect(onOpenFullscreen).toHaveBeenCalledOnce();
  });

  it('should request the French preview when the FR tab is chosen', () => {
    const onPreviewLangChange = vi.fn();
    render(<PreviewColumnHarness onPreviewLangChange={onPreviewLangChange} />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'FR' }));
    expect(onPreviewLangChange).toHaveBeenCalledWith('fr');
  });

  it('should mark the tab of the current preview language as selected', () => {
    render(<PreviewColumnHarness previewLang="fr" />);
    expect(screen.getByRole('tab', { name: 'FR' }).getAttribute('aria-selected')).toBe('true');
  });

  it('should omit the branding panel when branding is disabled, mirroring the classic login page', () => {
    mocks.branding = { ...BRANDED, enableBranding: false };
    render(<PreviewColumnHarness />);
    expect(screen.queryByRole('heading', { name: 'Acme Clinic' })).toBeNull();
  });

  it('should center a full-width login form when branding is disabled', () => {
    const { container } = render(<PreviewColumnHarness />);
    expect([...getLoginFormMock(container).classList]).toContain('w-full');
    expect([...getLoginFormMock(container).classList]).not.toContain('sm:w-2/5');
  });

  it('should show the branding panel in the preview language when branding is enabled', () => {
    mocks.branding = BRANDED;
    render(<PreviewColumnHarness previewLang="fr" />);
    expect(screen.getByRole('heading', { name: 'Clinique Acme' })).toBeTruthy();
  });

  it('should narrow the login form beside the branding panel when branding is enabled', () => {
    mocks.branding = BRANDED;
    const { container } = render(<PreviewColumnHarness />);
    expect([...getLoginFormMock(container).classList]).toContain('sm:w-2/5');
  });

  it('should paint the right-panel gradient behind the login form when branding has one', () => {
    mocks.branding = { ...BRANDED, rightPanelTheme: 'ocean' };
    const { container } = render(<PreviewColumnHarness />);
    expect(getLoginFormMock(container).style.backgroundImage).toContain('linear-gradient');
  });

  it('should leave the login form background plain when branding has no right-panel theme', () => {
    mocks.branding = BRANDED;
    const { container } = render(<PreviewColumnHarness />);
    expect(getLoginFormMock(container).style.backgroundImage).toBe('');
  });

  it('should ignore a right-panel theme while branding is disabled, since the classic page has none', () => {
    mocks.branding = { rightPanelTheme: 'ocean' };
    const { container } = render(<PreviewColumnHarness />);
    expect(getLoginFormMock(container).style.backgroundImage).toBe('');
  });

  it('should submit the branding form from the Save button, although it sits outside the form', () => {
    render(<PreviewColumnHarness />);
    const save = screen.getByRole('button', { name: 'Save' });
    expect([save.getAttribute('type'), save.getAttribute('form')]).toEqual(['submit', FORM_ID]);
  });

  it('should enable Save when the branding is valid', () => {
    render(<PreviewColumnHarness />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled).toBe(false);
  });

  it('should disable Save while a save is in flight, so it cannot be submitted twice', () => {
    mocks.isPending = true;
    render(<PreviewColumnHarness />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled).toBe(true);
  });
});
