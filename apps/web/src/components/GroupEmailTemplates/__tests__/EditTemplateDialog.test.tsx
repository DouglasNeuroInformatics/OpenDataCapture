import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';
import type { MailTemplate } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EditTemplateDialog } from '../EditTemplateDialog';

import '@/services/i18n';

const template: GroupEmailTemplate = {
  body: { en: 'Open {{url}} before {{expiresAt}}' },
  id: 'tpl-1',
  name: 'Reminder',
  subject: { en: 'Please complete' }
};

type RenderOptions = {
  isPending?: boolean;
  validateContent?: (template: MailTemplate) => string | undefined;
  validateName?: (name: string) => string | undefined;
  value?: GroupEmailTemplate | null;
};

const renderDialog = ({
  isPending = false,
  validateContent = () => undefined,
  validateName = () => undefined,
  value = template
}: RenderOptions = {}) => {
  const onOpenChange = vi.fn();
  const onSave = vi.fn();
  render(
    <EditTemplateDialog
      isPending={isPending}
      template={value}
      validateContent={validateContent}
      validateName={validateName}
      onOpenChange={onOpenChange}
      onSave={onSave}
    />
  );
  return { onOpenChange, onSave };
};

const saveButton = () => screen.getByTestId<HTMLButtonElement>('template-edit-save');

const submitForm = () => fireEvent.submit(saveButton().closest('form')!);

describe('EditTemplateDialog', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(cleanup);

  it('should not mount the form while no template is being edited', () => {
    renderDialog({ value: null });
    expect(screen.queryByTestId('template-edit-name')).toBeNull();
  });

  it('should prefill the form from the template being edited', () => {
    renderDialog();
    expect(screen.getByTestId<HTMLInputElement>('template-edit-name').value).toBe('Reminder');
    expect(screen.getByTestId<HTMLInputElement>('template-edit-subject').value).toBe('Please complete');
    expect(screen.getByTestId<HTMLTextAreaElement>('template-edit-body').value).toBe(template.body.en);
  });

  it('should save the edited template with its name trimmed', () => {
    const { onSave } = renderDialog();
    fireEvent.change(screen.getByTestId('template-edit-name'), { target: { value: '  Final notice  ' } });
    fireEvent.change(screen.getByTestId('template-edit-subject'), { target: { value: 'Last call' } });
    submitForm();
    expect(onSave).toHaveBeenCalledWith({ ...template, name: 'Final notice', subject: { en: 'Last call' } });
  });

  it('should validate the name as typed, so a duplicate can be rejected', () => {
    const validateName = vi.fn(() => undefined);
    renderDialog({ validateName });
    fireEvent.change(screen.getByTestId('template-edit-name'), { target: { value: 'Other' } });
    submitForm();
    expect(validateName).toHaveBeenCalledWith('Other');
  });

  it('should report an invalid name as an error notification instead of saving', () => {
    const { onSave } = renderDialog({ validateName: () => 'A name is required' });
    submitForm();
    expect(onSave).not.toHaveBeenCalled();
    expect(useNotificationsStore.getState().notifications).toMatchObject([
      { message: 'A name is required', type: 'error' }
    ]);
  });

  it('should show the content error and disable saving while the content is invalid', () => {
    renderDialog({ validateContent: () => 'Fill in the body' });
    expect(screen.getByTestId('template-edit-error').textContent).toBe('Fill in the body');
    expect(saveButton().disabled).toBe(true);
  });

  it('should not save invalid content even if the form is submitted', () => {
    const { onSave } = renderDialog({ validateContent: () => 'Fill in the body' });
    submitForm();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should disable saving while a save is pending, so it is not sent twice', () => {
    renderDialog({ isPending: true });
    expect(saveButton().disabled).toBe(true);
  });

  it('should request closing when cancelled', () => {
    const { onOpenChange } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
