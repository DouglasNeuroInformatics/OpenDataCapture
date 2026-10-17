import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@opendatacapture/schemas/core';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ViewDefaultTemplateDialog } from '../ViewDefaultTemplateDialog';

import '@/services/i18n';

/** Spanish deliberately left out, so a test can tell a scoped picker from an unscoped one. */
const ACTIVE_LANGUAGES: readonly Language[] = ['en', 'fr'];

describe('ViewDefaultTemplateDialog', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing while closed', () => {
    render(<ViewDefaultTemplateDialog activeLanguages={ACTIVE_LANGUAGES} open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByText('Built-in default template')).toBeNull();
  });

  it('should show the built-in subject and body when open', () => {
    render(<ViewDefaultTemplateDialog open activeLanguages={ACTIVE_LANGUAGES} onOpenChange={vi.fn()} />);
    expect(screen.getByTestId<HTMLInputElement>('template-builtin-subject').value).toBe(
      DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject.en
    );
    expect(screen.getByTestId<HTMLTextAreaElement>('template-builtin-body').value).toBe(
      DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body.en
    );
  });

  it('should make the built-in subject and body read-only, since the default template cannot be edited', () => {
    render(<ViewDefaultTemplateDialog open activeLanguages={ACTIVE_LANGUAGES} onOpenChange={vi.fn()} />);
    expect(screen.getByTestId<HTMLInputElement>('template-builtin-subject').readOnly).toBe(true);
    expect(screen.getByTestId<HTMLTextAreaElement>('template-builtin-body').readOnly).toBe(true);
  });

  it('should request closing when the close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<ViewDefaultTemplateDialog open activeLanguages={ACTIVE_LANGUAGES} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // Offering a language the instance has disabled invites authoring copy nothing will ever send.
  it('should offer only the languages the instance has enabled', () => {
    render(<ViewDefaultTemplateDialog open activeLanguages={ACTIVE_LANGUAGES} onOpenChange={vi.fn()} />);
    fireEvent.keyDown(screen.getByTestId('template-builtin-language'), { key: 'Enter' });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toStrictEqual(['English', 'French']);
  });
});
