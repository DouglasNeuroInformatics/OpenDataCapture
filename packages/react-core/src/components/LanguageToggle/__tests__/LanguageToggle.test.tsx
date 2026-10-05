import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { LanguageToggle } from '../LanguageToggle';

describe('LanguageToggle', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
  });

  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing when fewer than two languages are active', () => {
    render(<LanguageToggle activeLanguages={['en']} />);
    expect(screen.queryByTestId('language-toggle')).toBeNull();
  });

  it('should render the toggle when two or more languages are active', () => {
    render(<LanguageToggle activeLanguages={['en', 'fr']} />);
    expect(screen.getByTestId('language-toggle')).toBeTruthy();
  });

  it('should move off a language that has been deactivated, rather than strand a reader on it', async () => {
    render(<LanguageToggle activeLanguages={['es', 'fr']} />);
    await waitFor(() => {
      expect(i18n.resolvedLanguage).toBe('es');
    });
  });

  it('should leave a reader on a language that is still active', () => {
    i18n.changeLanguage('fr');
    render(<LanguageToggle activeLanguages={['en', 'fr']} />);
    expect(i18n.resolvedLanguage).toBe('fr');
  });

  it('should move a stranded reader even when only one language remains, where no toggle renders', () => {
    i18n.changeLanguage('fr');
    render(<LanguageToggle activeLanguages={['es']} />);
    expect(i18n.resolvedLanguage).toBe('es');
  });

  // The sidebar renders the toggle as a descendant while translating its own strings, so it is the
  // ancestor that has to re-render for the fix to be worth anything — asserting `resolvedLanguage`
  // alone passed while the sidebar stayed in the deactivated language.
  const Ancestor = ({ activeLanguages }: { activeLanguages: ActiveLanguages }) => {
    const { t } = useTranslation();
    return (
      <div>
        <span data-testid="ancestor-label">{t({ en: 'Dashboard', es: 'Panel de control', fr: 'Tableau' })}</span>
        <LanguageToggle activeLanguages={activeLanguages} />
      </div>
    );
  };

  it('should re-render an ancestor when a language is deactivated mid-session', () => {
    const { rerender } = render(<Ancestor activeLanguages={['en', 'es', 'fr']} />);
    act(() => i18n.changeLanguage('es'));
    expect(screen.getByTestId('ancestor-label').textContent).toBe('Panel de control');

    rerender(<Ancestor activeLanguages={['en', 'fr']} />);
    expect(i18n.resolvedLanguage).toBe('en');
    expect(screen.getByTestId('ancestor-label').textContent).toBe('Dashboard');
  });

  it('should leave a reader alone when the deactivated language was not theirs', () => {
    const { rerender } = render(<Ancestor activeLanguages={['en', 'es', 'fr']} />);
    act(() => i18n.changeLanguage('fr'));

    rerender(<Ancestor activeLanguages={['en', 'fr']} />);
    expect(i18n.resolvedLanguage).toBe('fr');
    expect(screen.getByTestId('ancestor-label').textContent).toBe('Tableau');
  });
});
