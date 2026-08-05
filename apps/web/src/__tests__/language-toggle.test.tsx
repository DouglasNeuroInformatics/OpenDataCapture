import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { LanguageToggle } from '@opendatacapture/react-core';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import { cleanup, render, screen } from '@testing-library/react';
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
});
