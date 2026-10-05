import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteTemplateDialog } from '../DeleteTemplateDialog';

import '@/services/i18n';

const template: GroupEmailTemplate = {
  body: { en: 'Open {{url}} before {{expiresAt}}' },
  id: 'tpl-1',
  name: 'Reminder',
  subject: { en: 'Please complete' }
};

const renderDialog = ({
  isPending = false,
  value = template
}: { isPending?: boolean; value?: GroupEmailTemplate | null } = {}) => {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  const result = render(
    <DeleteTemplateDialog isPending={isPending} template={value} onConfirm={onConfirm} onOpenChange={onOpenChange} />
  );
  return { ...result, onConfirm, onOpenChange };
};

describe('DeleteTemplateDialog', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should stay closed while no template awaits confirmation', () => {
    renderDialog({ value: null });
    expect(screen.queryByTestId('template-delete-confirm')).toBeNull();
  });

  it('should name the template being deleted, so the user knows what they are confirming', () => {
    renderDialog();
    expect(screen.getByText('Permanently delete "Reminder"? This cannot be undone.')).toBeTruthy();
  });

  it('should confirm the deletion of the pending template', () => {
    const { onConfirm } = renderDialog();
    fireEvent.click(screen.getByTestId('template-delete-confirm'));
    expect(onConfirm).toHaveBeenCalledWith(template);
  });

  it('should request closing when cancelled', () => {
    const { onOpenChange } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable the confirm button while a save is pending, so a deletion is not sent twice', () => {
    renderDialog({ isPending: true });
    expect(screen.getByTestId<HTMLButtonElement>('template-delete-confirm').disabled).toBe(true);
  });
});
