import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BrandingConfig, PanelSection } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { FORM_ID, SECTION_TITLES } from '../constants';
import { LoginPageEditor } from '../LoginPageEditor';

import '@/services/i18n';

type EditorMocks = {
  blocker: { status: 'blocked' | 'idle' };
  branding: BrandingConfig | null;
  mutate: Mock;
};

const mocks = vi.hoisted((): EditorMocks => ({
  blocker: { status: 'idle' },
  branding: null,
  mutate: vi.fn()
}));

vi.mock('@/config', () => ({
  config: { meta: { docsUrl: 'https://docs.example.org', githubRepoUrl: 'https://github.com/example/odc' } }
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { branding: mocks.branding } })
}));

vi.mock('@/hooks/useUpdateSetupStateMutation', () => ({
  useUpdateSetupStateMutation: () => ({ isPending: false, mutate: mocks.mutate })
}));

vi.mock('@tanstack/react-router', () => ({
  useBlocker: () => mocks.blocker
}));

const getBrandingForm = () => document.getElementById(FORM_ID)!;

const getInstanceNameInput = () => document.getElementById('instanceName-en')!;

describe('LoginPageEditor', () => {
  beforeEach(() => {
    mocks.blocker = { status: 'idle' };
    mocks.branding = null;
    mocks.mutate.mockClear();
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should title the page', () => {
    render(<LoginPageEditor />);
    expect(screen.getByRole('heading', { name: 'Customize Login Page' })).toBeTruthy();
  });

  it('should lay out the section cards in the saved order, so the editor mirrors the panel', () => {
    const sectionsOrder: PanelSection[] = ['resources', 'details', 'tagline', 'name', 'logo'];
    mocks.branding = { sectionsOrder };
    render(<LoginPageEditor />);
    const titles = sectionsOrder.map((section) => SECTION_TITLES[section].en);
    const rendered = within(getBrandingForm()).getAllByText(new RegExp(`^(${titles.join('|')})$`));
    expect(rendered.map((element) => element.textContent)).toEqual(titles);
  });

  it('should keep Enter in a text input from submitting the form, so only Save submits', () => {
    render(<LoginPageEditor />);
    expect(fireEvent.keyDown(getInstanceNameInput(), { key: 'Enter' })).toBe(false);
  });

  it('should let Enter through in a text area, so multi-line text still gets new lines', () => {
    render(<LoginPageEditor />);
    expect(fireEvent.keyDown(document.getElementById('instanceDetails-en')!, { key: 'Enter' })).toBe(true);
  });

  it('should let other keys through in a text input, so typing is unaffected', () => {
    render(<LoginPageEditor />);
    expect(fireEvent.keyDown(getInstanceNameInput(), { key: 'a' })).toBe(true);
  });

  it('should save the edited branding from the Save button, although it sits outside the form', () => {
    render(<LoginPageEditor />);
    fireEvent.change(getInstanceNameInput(), { target: { value: 'Acme Clinic' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(mocks.mutate).toHaveBeenCalledWith(
      { branding: expect.objectContaining({ instanceName: { en: 'Acme Clinic', fr: null } }) },
      expect.anything()
    );
  });

  it('should open the fullscreen preview from the preview column', () => {
    render(<LoginPageEditor />);
    fireEvent.click(screen.getByRole('button', { name: 'Fullscreen preview' }));
    expect(screen.getByRole('dialog', { name: 'Login page fullscreen preview' })).toBeTruthy();
  });

  it('should carry the preview language chosen in the column into the fullscreen preview', () => {
    render(<LoginPageEditor />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'FR' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fullscreen preview' }));
    expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'Se connecter' })).toBeTruthy();
  });

  it('should close the fullscreen preview when dismissed', () => {
    render(<LoginPageEditor />);
    fireEvent.click(screen.getByRole('button', { name: 'Fullscreen preview' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should ask for confirmation when navigation away is blocked', () => {
    mocks.blocker = { status: 'blocked' };
    render(<LoginPageEditor />);
    expect(screen.getByRole('dialog', { name: 'Unsaved Changes' })).toBeTruthy();
  });
});
