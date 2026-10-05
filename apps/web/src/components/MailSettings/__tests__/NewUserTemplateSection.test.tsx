import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { DEFAULT_NEW_USER_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { MailTemplate } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NewUserTemplateSection } from '../NewUserTemplateSection';

import '@/services/i18n';

const spanishOnly: MailTemplate = {
  body: { es: 'Hola, su usuario es {{username}}' },
  subject: { es: 'Su cuenta' }
};

const renderSection = (template: MailTemplate = spanishOnly, isSaving = false) => {
  const onSave = vi.fn();
  render(<NewUserTemplateSection isSaving={isSaving} template={template} onSave={onSave} />);
  return { onSave };
};

const saveButton = () => screen.getByTestId('mail-template-save');
const subjectInput = () => screen.getByTestId<HTMLInputElement>('new-user-template-subject');
const errorText = () => screen.queryByTestId('new-user-template-error')?.textContent;

describe('NewUserTemplateSection', () => {
  beforeEach(() => {
    void i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should fill the languages the saved template lacks from the default, so a partial template is still sendable', () => {
    const { onSave } = renderSection();
    fireEvent.click(saveButton());
    expect(onSave).toHaveBeenCalledWith({
      body: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.body, ...spanishOnly.body },
      subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject, ...spanishOnly.subject }
    });
  });

  it('should prefer the saved text over the default', () => {
    renderSection({ body: spanishOnly.body, subject: { ...spanishOnly.subject, en: 'Welcome aboard' } });
    expect(subjectInput().value).toBe('Welcome aboard');
  });

  it('should require every language, since the admin may send the message in any of them', () => {
    renderSection({ body: {}, subject: {} });
    expect(errorText()).toBe('Fill in the subject and body for each language.');
    expect(saveButton().hasAttribute('disabled')).toBe(true);
  });

  it('should require the username placeholder, since the message is useless without it', () => {
    renderSection({ body: { es: 'Hola' }, subject: { es: 'Su cuenta' } });
    expect(errorText()).toBe('The body must include {{username}}.');
    expect(saveButton().hasAttribute('disabled')).toBe(true);
  });

  it('should show no error for a complete template', () => {
    renderSection();
    expect(errorText()).toBeUndefined();
  });

  it('should restore the default template when reset', () => {
    renderSection({ body: spanishOnly.body, subject: { ...spanishOnly.subject, en: 'Welcome aboard' } });
    fireEvent.click(screen.getByTestId('mail-template-reset'));
    expect(subjectInput().value).toBe(DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject.en);
  });

  it('should save the edits the admin made', () => {
    const { onSave } = renderSection();
    fireEvent.change(subjectInput(), { target: { value: 'Welcome aboard' } });
    fireEvent.click(saveButton());
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject, en: 'Welcome aboard', es: 'Su cuenta' }
      })
    );
  });

  it('should disable saving and show a spinner while a save is in flight', () => {
    renderSection(spanishOnly, true);
    expect(saveButton().hasAttribute('disabled')).toBe(true);
    expect(saveButton().querySelector('svg')).not.toBeNull();
  });

  it('should not show a spinner when idle', () => {
    renderSection();
    expect(saveButton().querySelector('svg')).toBeNull();
  });
});
