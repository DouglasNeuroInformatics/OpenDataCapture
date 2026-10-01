import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StartSessionForm } from '@/components/StartSessionForm';

import '@/services/i18n';

vi.mock('axios');

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

const onSubmit = vi.fn();

const groupWithIdPattern = (idValidationRegex: string): Group => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID', idValidationRegex },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02'),
  userIds: []
});

const renderForm = (customSubjectIds: string[], currentGroup: Group | null = null) => {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <StartSessionForm
        currentGroup={currentGroup}
        customSubjectIds={customSubjectIds}
        readOnly={false}
        username="admin"
        onSubmit={onSubmit}
      />
    </QueryClientProvider>
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

const dateOfBirthInput = () => screen.getByTestId<HTMLInputElement>('date-input');
const sexTrigger = () => screen.getByTestId<HTMLButtonElement>('subjectSex-select-trigger');

const pickIdentifier = (identifier: string) => {
  typeIdentifier(identifier);
  fireEvent.click(screen.getByTestId(`subjectId-combobox-item-${identifier}`));
};

const existingSubject = (demographics: { dateOfBirth: null | string; sex: null | string }) => {
  get.mockResolvedValueOnce({ data: demographics, status: 200 });
};

/** Every error shown, with the field it landed on, so one that moved to the form's own errors fails too. */
const errorMessages = () =>
  screen.queryAllByTestId('error-message-text').map((element) => ({
    field: element.closest('[data-field-group]')?.getAttribute('data-field-group'),
    message: element.textContent
  }));

const subjectIdError = (message: string) => ({ field: 'subjectId', message });

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
  vi.clearAllMocks();
  get.mockResolvedValue({ data: null, status: 404 });
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
    await waitFor(() => expect(errorMessages()).toEqual([subjectIdError('Illegal character: $')]));
  });

  it('should show only the required-field error for an identifier that was typed and then cleared', async () => {
    const form = renderForm([]);
    typeIdentifier('abc');
    typeIdentifier('');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(errorMessages()).toEqual([subjectIdError('This field is required')]));
  });

  it("should show only the group's pattern error for an identifier the pattern rejects, so the regex check still applies", async () => {
    const form = renderForm([], groupWithIdPattern('^[a-z]+$'));
    typeIdentifier('abc1');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(errorMessages()).toEqual([subjectIdError('Must match regular expression: ^[a-z]+$')]));
  });

  it("should reject an identifier containing the scope separator even when the group's pattern accepts it, since no group may make the scoped id ambiguous", async () => {
    const form = renderForm([], groupWithIdPattern('^.+$'));
    typeIdentifier('abc$def');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(errorMessages()).toEqual([subjectIdError('Illegal character: $')]));
  });

  it("should show only the illegal-character error for an identifier the group's pattern also rejects, not a second error for the same field", async () => {
    const form = renderForm([], groupWithIdPattern('^[a-z]+$'));
    typeIdentifier('abc$def');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(errorMessages()).toEqual([subjectIdError('Illegal character: $')]));
  });

  it("should submit an identifier the group's pattern accepts, scoped by that group's name", async () => {
    const form = renderForm([], groupWithIdPattern('^[a-z]+$'));
    typeIdentifier('abc');
    closeIdentifierPopup();
    submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(submittedSubjectId()).toBe('Group_One$abc');
  });
});

describe('StartSessionForm with an existing subject', () => {
  it('should look the subject up by the id the form would submit, so the details shown are that subject’s', async () => {
    renderForm(['alpha']);
    pickIdentifier('alpha');
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith(`/v1/subjects/${DEFAULT_GROUP_NAME}%24alpha`, expect.anything())
    );
  });

  it('should fill in and lock the date of birth and sex the subject already records', async () => {
    existingSubject({ dateOfBirth: '1990-06-15', sex: 'FEMALE' });
    renderForm(['alpha']);
    pickIdentifier('alpha');
    await waitFor(() => expect(dateOfBirthInput().value).toBe('1990-06-15'));
    expect(dateOfBirthInput().disabled).toBe(true);
    expect(sexTrigger().disabled).toBe(true);
  });

  it('should submit the filled-in details, so the locked values reach the session', async () => {
    existingSubject({ dateOfBirth: '1990-06-15', sex: 'FEMALE' });
    const form = renderForm(['alpha']);
    pickIdentifier('alpha');
    await waitFor(() => expect(sexTrigger().disabled).toBe(true));
    submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.lastCall?.[0].subjectData).toMatchObject({
      dateOfBirth: new Date('1990-06-15'),
      sex: 'FEMALE'
    });
  });

  it('should lock only the details the subject records, leaving the rest editable', async () => {
    existingSubject({ dateOfBirth: null, sex: 'MALE' });
    renderForm(['alpha']);
    pickIdentifier('alpha');
    await waitFor(() => expect(sexTrigger().disabled).toBe(true));
    expect(dateOfBirthInput().disabled).toBe(false);
  });

  it('should not look up an identifier absent from the options, since no subject can have it', () => {
    renderForm(['alpha']);
    typeIdentifier('gamma');
    closeIdentifierPopup();
    expect(get).not.toHaveBeenCalled();
  });

  it('should clear and unlock the details when the identifier changes to a new one, so a new subject inherits nothing', async () => {
    existingSubject({ dateOfBirth: '1990-06-15', sex: 'FEMALE' });
    renderForm(['alpha']);
    pickIdentifier('alpha');
    await waitFor(() => expect(dateOfBirthInput().disabled).toBe(true));
    typeIdentifier('gamma');
    closeIdentifierPopup();
    await waitFor(() => expect(dateOfBirthInput().disabled).toBe(false));
    expect(dateOfBirthInput().value).toBe('');
    expect(sexTrigger().disabled).toBe(false);
  });
});
