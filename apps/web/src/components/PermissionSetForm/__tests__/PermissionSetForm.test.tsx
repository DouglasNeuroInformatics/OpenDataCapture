import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionSetForm } from '@/components/PermissionSetForm/PermissionSetForm';

import '@/services/i18n';

const onSubmit = vi.fn();

const RULE: PermissionSetRule = { action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' };

const field = (name: string) => document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;

const type = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });

const choose = (field: 'action' | 'subject', value: string) => {
  fireEvent.keyDown(screen.getAllByTestId(`rule-${field}-select-trigger`).at(-1)!, { key: 'Enter' });
  fireEvent.click(screen.getByTestId(`rule-${field}-select-item-${value}`));
};

const submit = () => fireEvent.click(screen.getByLabelText('Submit'));

const errorMessages = () => screen.queryAllByTestId('error-message-text').map((element) => element.textContent);

describe('PermissionSetForm', () => {
  beforeEach(() => {
    onSubmit.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should submit the name and the rule rows filled in, without needing each row added first', async () => {
    render(<PermissionSetForm submitLabel="Create" onSubmit={onSubmit} />);
    type('name', 'Research Assistant');
    choose('action', 'read');
    choose('subject', 'Subject');
    submit();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Research Assistant', rules: [RULE] });
    });
  });

  it('should refuse a set with no rules, which would grant nothing', async () => {
    render(<PermissionSetForm submitLabel="Create" onSubmit={onSubmit} />);
    type('name', 'Empty');
    submit();
    await waitFor(() => expect(errorMessages().join()).toContain('Add at least one rule'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should refuse a half-filled rule row and highlight it, rather than silently dropping it', async () => {
    render(<PermissionSetForm initialValues={{ name: 'Set', rules: [RULE] }} submitLabel="Save" onSubmit={onSubmit} />);
    choose('action', 'create');
    submit();
    await waitFor(() => expect(errorMessages().join()).toContain('A rule row is incomplete'));
    expect(screen.getByTestId('add-rule-row').getAttribute('aria-invalid')).toBe('true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should refuse a set without a name', async () => {
    render(<PermissionSetForm submitLabel="Create" onSubmit={onSubmit} />);
    choose('action', 'read');
    choose('subject', 'Subject');
    submit();
    await waitFor(() => expect(errorMessages().length).toBeGreaterThan(0));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should start from the set being edited', () => {
    render(
      <PermissionSetForm
        initialValues={{ name: 'Research Assistant', rules: [RULE] }}
        submitLabel="Save"
        onSubmit={onSubmit}
      />
    );
    expect(field('name').value).toBe('Research Assistant');
    expect(screen.getAllByTestId('permission-set-rule-row')).toHaveLength(1);
  });

  it('should render a secondary action beside the submit button', () => {
    render(
      <PermissionSetForm
        secondaryAction={<button data-testid="secondary-action" type="button" />}
        submitLabel="Save"
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByTestId('secondary-action').parentElement).toBe(screen.getByLabelText('Submit').parentElement);
  });

  it('should keep the saved rules listed and offer a fresh row once a save succeeds', async () => {
    render(<PermissionSetForm initialValues={{ name: 'Set', rules: [RULE] }} submitLabel="Save" onSubmit={onSubmit} />);
    choose('action', 'create');
    choose('subject', 'Session');
    submit();
    await waitFor(() => expect(screen.getAllByTestId('permission-set-rule-row')).toHaveLength(2));
    expect(screen.getByTestId('rule-action-select-trigger').textContent).toBe('Choose…');
    expect(field('name').value).toBe('Set');
  });

  it('should show why a save failed and keep the unsaved row, so nothing entered is lost', async () => {
    onSubmit.mockResolvedValue({ errorMessage: "Permission set with name 'Set' already exists!", success: false });
    render(<PermissionSetForm initialValues={{ name: 'Set', rules: [RULE] }} submitLabel="Save" onSubmit={onSubmit} />);
    choose('action', 'create');
    choose('subject', 'Session');
    submit();
    expect(await screen.findByText("Permission set with name 'Set' already exists!")).toBeTruthy();
    expect(screen.getAllByTestId('permission-set-rule-row')).toHaveLength(1);
    expect(screen.getByTestId('rule-action-select-trigger').textContent).toBe('Create');
  });
});
