import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { MailTemplate } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateTemplateForm } from '../CreateTemplateForm';

import '@/services/i18n';

type RenderOptions = {
  isPending?: boolean;
  onCreate?: (name: string, template: MailTemplate) => Promise<boolean>;
  validateContent?: (template: MailTemplate) => string | undefined;
  validateName?: (name: string) => string | undefined;
};

const renderForm = ({
  isPending = false,
  onCreate = vi.fn(() => Promise.resolve(true)),
  validateContent = () => undefined,
  validateName = () => undefined
}: RenderOptions = {}) => {
  render(
    <CreateTemplateForm
      isPending={isPending}
      validateContent={validateContent}
      validateName={validateName}
      onCreate={onCreate}
    />
  );
  return { onCreate };
};

const nameInput = () => screen.getByTestId<HTMLInputElement>('template-name');
const subjectInput = () => screen.getByTestId<HTMLInputElement>('template-create-subject');
const submitButton = () => screen.getByTestId<HTMLButtonElement>('template-create-submit');

const switchLanguage = (label: string) => {
  fireEvent.click(screen.getByTestId('template-create-language'));
  fireEvent.click(screen.getByRole('option', { name: label }));
};

const fillContent = (subject: string, body: string) => {
  fireEvent.change(subjectInput(), { target: { value: subject } });
  fireEvent.change(screen.getByTestId('template-create-body'), { target: { value: body } });
};

const fillEnglishOnly = (name: string) => {
  fireEvent.change(nameInput(), { target: { value: name } });
  fillContent('Please complete', 'Open {{url}} before {{expiresAt}}');
};

describe('CreateTemplateForm', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should report an invalid name as an error notification instead of creating', () => {
    const { onCreate } = renderForm({ validateName: () => 'A name is required' });
    fireEvent.click(submitButton());
    expect(onCreate).not.toHaveBeenCalled();
    expect(useNotificationsStore.getState().notifications).toMatchObject([
      { message: 'A name is required', type: 'error' }
    ]);
  });

  it('should show the content error and disable submitting while the content is invalid', () => {
    renderForm({ validateContent: () => 'Fill in the body' });
    expect(screen.getByTestId('template-create-error').textContent).toBe('Fill in the body');
    expect(submitButton().disabled).toBe(true);
  });

  it('should not create invalid content even if the form is submitted', () => {
    const { onCreate } = renderForm({ validateContent: () => 'Fill in the body' });
    fireEvent.submit(screen.getByTestId('template-create-form'));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('should disable submitting while a save is pending, so a template is not added twice', () => {
    renderForm({ isPending: true });
    expect(submitButton().disabled).toBe(true);
  });

  it('should warn about the languages left untranslated before creating', () => {
    const { onCreate } = renderForm();
    fillEnglishOnly('Reminder');
    fireEvent.click(submitButton());
    expect(screen.getByText('Warning: This template is missing translations for: Spanish, French.')).toBeTruthy();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('should create the template with its name trimmed once the user adds it anyway', () => {
    const { onCreate } = renderForm();
    fillEnglishOnly('  Reminder  ');
    fireEvent.click(submitButton());
    fireEvent.click(screen.getByTestId('template-create-anyway'));
    expect(onCreate).toHaveBeenCalledWith('Reminder', {
      body: { en: 'Open {{url}} before {{expiresAt}}' },
      subject: { en: 'Please complete' }
    });
  });

  it('should close the warning without creating when the user cancels', () => {
    const { onCreate } = renderForm();
    fillEnglishOnly('Reminder');
    fireEvent.click(submitButton());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('template-create-anyway')).toBeNull();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('should create without a warning when every language is translated', () => {
    const { onCreate } = renderForm();
    fillEnglishOnly('Reminder');
    switchLanguage('Spanish');
    fillContent('Por favor', 'Abra {{url}} antes de {{expiresAt}}');
    switchLanguage('French');
    fillContent('Veuillez', 'Ouvrez {{url}} avant {{expiresAt}}');
    fireEvent.click(submitButton());
    expect(screen.queryByTestId('template-create-anyway')).toBeNull();
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('should clear the form and scroll back to it once the template is saved', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    renderForm();
    fillEnglishOnly('Reminder');
    fireEvent.click(submitButton());
    fireEvent.click(screen.getByTestId('template-create-anyway'));
    await waitFor(() => expect(nameInput().value).toBe(''));
    expect(subjectInput().value).toBe('');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should keep the draft when the save fails, so nothing the user typed is lost', async () => {
    const onCreate = vi.fn(() => Promise.resolve(false));
    renderForm({ onCreate });
    fillEnglishOnly('Reminder');
    fireEvent.click(submitButton());
    fireEvent.click(screen.getByTestId('template-create-anyway'));
    await waitFor(() => expect(onCreate).toHaveBeenCalledOnce());
    expect(nameInput().value).toBe('Reminder');
    expect(subjectInput().value).toBe('Please complete');
  });
});
