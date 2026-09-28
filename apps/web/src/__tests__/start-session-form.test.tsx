import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StartSessionForm } from '@/components/StartSessionForm';

import '@/services/i18n';

const onSubmit = vi.fn();

const groupWithIdPattern: Group = {
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID', idValidationRegex: '^[a-z]+$' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02'),
  userIds: []
};

const renderForm = (customSubjectIds: string[], currentGroup: Group | null = null) => {
  render(
    <StartSessionForm
      currentGroup={currentGroup}
      customSubjectIds={customSubjectIds}
      readOnly={false}
      username="admin"
      onSubmit={onSubmit}
    />
  );
  const form = screen.getByTestId('start-session-form');
  fireEvent.change(form.querySelector('[name="subjectIdentificationMethod"]')!, {
    target: { value: 'CUSTOM_ID' }
  });
  return form;
};

const identifierInput = () => screen.getByTestId<HTMLInputElement>('subjectId-combobox-input');

/**
 * Base UI reads `inputType` to tell typing from autofill and only opens the popup for the former,
 * so `fireEvent.change` — which sets no `inputType` — would leave it closed.
 */
const typeIdentifier = (identifier: string) => {
  fireEvent.input(identifierInput(), { inputType: 'insertText', target: { value: identifier } });
};

/** A custom value is committed when the popup closes, not on each keystroke. */
const closeIdentifierPopup = () => {
  fireEvent.keyDown(identifierInput(), { key: 'Enter' });
};

const submit = (form: HTMLElement) => {
  fireEvent.change(form.querySelector('[name="sessionType"]')!, { target: { value: 'IN_PERSON' } });
  fireEvent.click(screen.getByLabelText('Submit'));
};

const submittedSubjectId = () => onSubmit.mock.lastCall?.[0].subjectData.id;

const errorMessages = () => screen.queryAllByTestId('error-message-text').map((element) => element.textContent);

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
  vi.clearAllMocks();
});

describe('StartSessionForm', () => {
  // A new subject's identifier is by definition absent from the options, so the combobox has to keep
  // text matching no option rather than reverting to the empty selection when the popup closes.
  it('should submit an identifier that matches no existing subject, so a new subject can be enrolled', async () => {
    const form = renderForm(['alpha']);
    typeIdentifier('gamma');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedSubjectId()).toBe(`${DEFAULT_GROUP_NAME}$gamma`);
  });

  it('should leave an identifier matching no existing subject in the input, so the clinician sees what they typed', () => {
    renderForm(['alpha']);
    typeIdentifier('gamma');
    closeIdentifierPopup();
    expect(identifierInput().value).toBe('gamma');
  });

  it('should offer the identifiers already in use as options, so an existing subject can be chosen', () => {
    renderForm(['alpha']);
    typeIdentifier('alpha');
    expect(screen.getByTestId('subjectId-combobox-item-alpha')).toBeTruthy();
  });

  it('should submit an identifier picked from the options, so a returning subject reuses their own id', async () => {
    const form = renderForm(['alpha']);
    typeIdentifier('alpha');
    fireEvent.click(screen.getByTestId('subjectId-combobox-item-alpha'));
    submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedSubjectId()).toBe(`${DEFAULT_GROUP_NAME}$alpha`);
  });

  // The identifier is scoped by prefixing the group name and a `$`, so one inside the identifier
  // would make the stored id ambiguous. Validation has to reach a custom value too, not just an option.
  it('should reject a custom identifier containing the scope separator', async () => {
    const form = renderForm(['alpha']);
    typeIdentifier('gam$ma');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(screen.getByText('Illegal character: $')).toBeTruthy());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show only the illegal-character error for an identifier containing the scope separator, not a contradictory required-field error', async () => {
    const form = renderForm([]);
    typeIdentifier('abc$def');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(errorMessages()).toEqual(['Illegal character: $']));
  });

  it('should show only the required-field error for an identifier that was typed and then cleared', async () => {
    const form = renderForm([]);
    typeIdentifier('abc');
    typeIdentifier('');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(errorMessages()).toEqual(['This field is required']));
  });

  it("should show only the group's pattern error for an identifier the pattern rejects, so the regex check still applies", async () => {
    const form = renderForm([], groupWithIdPattern);
    typeIdentifier('abc1');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(errorMessages()).toEqual(['Must match regular expression: ^[a-z]+$']));
  });
});
