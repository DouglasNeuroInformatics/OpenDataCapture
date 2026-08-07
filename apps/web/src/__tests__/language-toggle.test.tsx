import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { LanguageToggle } from '@opendatacapture/react-core';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import '@/services/i18n';

describe('LanguageToggle', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  const renderToggle = (activeLanguages: ActiveLanguages) =>
    render(<LanguageToggle activeLanguages={activeLanguages} />);

  it('should render nothing when the instance offers only one language, so no control is a no-op', () => {
    const { container } = renderToggle(['en']);
    expect(container.firstChild).toBeNull();
  });

  it('should render a trigger when the instance offers more than one language', () => {
    renderToggle(['en', 'es']);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should move a user off a language the instance no longer offers', () => {
    i18n.changeLanguage('es');
    renderToggle(['en', 'fr']);
    expect(i18n.resolvedLanguage).toBe('en');
  });

  it('should leave a user on a language the instance still offers', () => {
    i18n.changeLanguage('fr');
    renderToggle(['en', 'fr']);
    expect(i18n.resolvedLanguage).toBe('fr');
  });

  it('should move a stranded user even when only one language remains, where no toggle renders', () => {
    i18n.changeLanguage('fr');
    renderToggle(['es']);
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
