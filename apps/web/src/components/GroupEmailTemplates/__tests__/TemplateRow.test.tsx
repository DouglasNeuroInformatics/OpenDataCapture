import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TemplateRow } from '../TemplateRow';

import '@/services/i18n';

const renderRow = ({ isActive = false, isPending = false } = {}) => {
  const onSetActive = vi.fn();
  render(
    <TemplateRow
      actions={<button aria-label="Row action" type="button" />}
      isActive={isActive}
      isPending={isPending}
      label="Reminder"
      rowId="tpl-1"
      onSetActive={onSetActive}
    />
  );
  return { onSetActive };
};

describe('TemplateRow', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render the label alongside the row actions', () => {
    renderRow();
    const row = screen.getByTestId('template-row');
    expect(row.textContent).toContain('Reminder');
    expect(screen.getByRole('button', { name: 'Row action' })).toBeTruthy();
  });

  it('should mark the active template as the default instead of offering to set it', () => {
    renderRow({ isActive: true });
    expect(screen.getByTestId('template-active-tpl-1').textContent).toBe('Default');
    expect(screen.queryByTestId('template-set-active-tpl-1')).toBeNull();
  });

  it('should make an inactive template the default when its button is clicked', () => {
    const { onSetActive } = renderRow();
    fireEvent.click(screen.getByTestId('template-set-active-tpl-1'));
    expect(onSetActive).toHaveBeenCalledOnce();
  });

  it('should disable the set-default button while a save is pending, so changes cannot race', () => {
    renderRow({ isPending: true });
    expect(screen.getByTestId<HTMLButtonElement>('template-set-active-tpl-1').disabled).toBe(true);
  });
});
