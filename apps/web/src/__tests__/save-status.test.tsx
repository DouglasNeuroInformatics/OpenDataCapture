import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SaveStatus } from '@/components/SaveStatus';

import '@/services/i18n';

describe('SaveStatus', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing when idle, so the pill is absent between saves', () => {
    const { container } = render(<SaveStatus state="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('should report a failure rather than a save, so a rejected autosave is never read as stored', () => {
    render(<SaveStatus state="error" />);
    expect(screen.getByText('Could not save changes')).toBeTruthy();
    expect(screen.queryByText('All changes saved')).toBeNull();
  });

  it('should confirm the save only once it has succeeded', () => {
    render(<SaveStatus state="saved" />);
    expect(screen.getByText('All changes saved')).toBeTruthy();
  });
});
