import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { Group, GroupSettings } from '@opendatacapture/schemas/group';
import type { CustomFieldsDefinition } from '@opendatacapture/schemas/subject-identification';
import { deriveCustomFieldsSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, getByText, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StartSessionForm } from '@/components/StartSessionForm/StartSessionForm';

import '@/services/i18n';

vi.mock('axios');

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

const onSubmit = vi.fn();

const groupWithSettings = (settings: Partial<GroupSettings>): Group => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID', ...settings },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02'),
  userIds: []
});

const groupWithIdPattern = (idValidationRegex: string) => groupWithSettings({ idValidationRegex });

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const customFieldsDefinition: CustomFieldsDefinition = {
  fields: [
    { label: { en: 'Animal ID' }, pattern: '[A-Z]{2}[0-9]+', patternErrorMessage: { en: 'Two letters, then digits' } },
    { label: { en: 'Cage' }, pattern: '[0-9]+' }
  ],
  iterations: 1000,
  label: { en: 'Animal information' },
  salt: '0f'.repeat(32)
};

const renderForm = (
  customSubjectIds: string[],
  currentGroup: Group | null = null,
  method: 'CUSTOM_FIELDS' | 'CUSTOM_ID' | 'PERSONAL_INFO' = 'CUSTOM_ID',
  queryClient = createQueryClient(),
  definition: CustomFieldsDefinition | null = null
) => {
  render(
    <QueryClientProvider client={queryClient}>
      <StartSessionForm
        currentGroup={currentGroup}
        customSubjectIds={customSubjectIds}
        readOnly={false}
        subjectIdentificationSettings={{
          customFields: definition,
          offeredMethods: definition ? ['CUSTOM_ID', 'PERSONAL_INFO', 'CUSTOM_FIELDS'] : ['CUSTOM_ID', 'PERSONAL_INFO']
        }}
        username="admin"
        onSubmit={onSubmit}
      />
    </QueryClientProvider>
  );
  const form = screen.getByTestId('start-session-form');
  fireEvent.change(form.querySelector('[name="subjectIdentificationMethod"]')!, {
    target: { value: method }
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

const submitButton = () => screen.getByLabelText<HTMLButtonElement>('Submit');

/**
 * The form holds its submit button disabled on a real 500ms timer after `onSubmit` resolves, then
 * updates its state. Waiting for the button to come back keeps that update inside the test, rather
 * than landing after the environment is torn down.
 */
const submitAndSettle = async (form: HTMLElement) => {
  submit(form);
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  await waitFor(() => expect(submitButton().disabled).toBe(true));
  await waitFor(() => expect(submitButton().disabled).toBe(false), { timeout: 1000 });
};

const submittedSubjectId = () => onSubmit.mock.lastCall?.[0].subjectData.id;

const dateOfBirthInput = () => screen.getByTestId<HTMLInputElement>('date-input');

/** The date input commits typed text when it loses focus, not on each keystroke. */
const enterDateOfBirth = (date: string) => {
  fireEvent.focus(dateOfBirthInput());
  fireEvent.change(dateOfBirthInput(), { target: { value: date } });
  fireEvent.blur(dateOfBirthInput());
};

const fillPersonalInfo = (form: HTMLElement, values: { dateOfBirth?: string; firstName?: string }) => {
  if (values.firstName) {
    fireEvent.change(form.querySelector('[name="subjectFirstName"]')!, { target: { value: values.firstName } });
  }
  fireEvent.change(form.querySelector('[name="subjectLastName"]')!, { target: { value: 'Doe' } });
  if (values.dateOfBirth) {
    enterDateOfBirth(values.dateOfBirth);
  }
  fireEvent.change(form.querySelector('[name="subjectSex"]')!, { target: { value: 'FEMALE' } });
};

const sexTrigger = () => screen.getByTestId<HTMLButtonElement>('subjectSex-select-trigger');

const pickIdentifier = (identifier: string) => {
  typeIdentifier(identifier);
  fireEvent.click(screen.getByTestId(`subjectId-combobox-item-${identifier}`));
};

const existingSubject = (demographics: { dateOfBirth: null | string; sex: null | string }) => {
  const dateOfBirth = demographics.dateOfBirth === null ? null : `${demographics.dateOfBirth}T00:00:00.000Z`;
  get.mockResolvedValueOnce({ data: { ...demographics, dateOfBirth }, status: 200 });
};

/** Every error shown, with the field it landed on, so one that moved to the form's own errors fails too. */
const errorMessages = () => {
  return screen.queryAllByTestId('error-message-text').map((element) => ({
    field: element.closest('[data-field-group]')?.getAttribute('data-field-group'),
    message: element.textContent
  }));
};

const subjectIdError = (message: string) => ({ field: 'subjectId', message });

describe('StartSessionForm', () => {
  beforeEach(() => {
    // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
    cleanup();
    vi.clearAllMocks();
    get.mockResolvedValue({ data: null, status: 404 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A new subject's identifier is by definition absent from the options, so the combobox has to keep
  // text matching no option rather than reverting to the empty selection when the popup closes.
  it('should submit an identifier that matches no existing subject, so a new subject can be enrolled', async () => {
    const form = renderForm(['alpha']);
    typeIdentifier('gamma');
    closeIdentifierPopup();
    await submitAndSettle(form);
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
    await submitAndSettle(form);
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
    await submitAndSettle(form);
    expect(submittedSubjectId()).toBe('Group_One$abc');
  });

  describe('with an existing subject', () => {
    it('should look the subject up by the id the form would submit, so the details shown are that subject’s', async () => {
      renderForm(['alpha']);
      pickIdentifier('alpha');
      await waitFor(() => {
        expect(get).toHaveBeenCalledWith(`/v1/subjects/${DEFAULT_GROUP_NAME}%24alpha`, expect.anything());
      });
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
      await submitAndSettle(form);
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

    // The popup closes on Enter, a click away or a tab, so a clinician who types a returning
    // subject's id in full never has to pick it from the list.
    it('should fill in the details when a typed identifier matches an existing subject, as picking it would', async () => {
      existingSubject({ dateOfBirth: '1990-06-15', sex: 'MALE' });
      renderForm(['alpha']);
      typeIdentifier('alpha');
      closeIdentifierPopup();
      await waitFor(() => expect(sexTrigger().disabled).toBe(true));
      expect(dateOfBirthInput().value).toBe('1990-06-15');
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

  describe('with a custom identifier', () => {
    it('should attribute the session to the current group, so it is filed where the clinician is working', async () => {
      const form = renderForm([], groupWithSettings({}));
      typeIdentifier('abc');
      closeIdentifierPopup();
      await submitAndSettle(form);
      expect(onSubmit.mock.lastCall?.[0]).toMatchObject({ groupId: 'group-1', username: 'admin' });
    });

    it('should submit a null username when none is known, rather than an undefined one the API would reject', async () => {
      render(
        <QueryClientProvider client={new QueryClient()}>
          <StartSessionForm
            currentGroup={null}
            customSubjectIds={[]}
            readOnly={false}
            subjectIdentificationSettings={{ customFields: null, offeredMethods: ['CUSTOM_ID', 'PERSONAL_INFO'] }}
            onSubmit={onSubmit}
          />
        </QueryClientProvider>
      );
      const form = screen.getByTestId('start-session-form');
      fireEvent.change(form.querySelector('[name="subjectIdentificationMethod"]')!, { target: { value: 'CUSTOM_ID' } });
      typeIdentifier('abc');
      closeIdentifierPopup();
      await submitAndSettle(form);
      expect(onSubmit.mock.lastCall?.[0]).toMatchObject({ groupId: null, username: null });
    });

    it("should show the group's own message for an identifier its pattern rejects, in the clinician's language", async () => {
      const form = renderForm(
        [],
        groupWithSettings({ idValidationRegex: '^[a-z]+$', idValidationRegexErrorMessage: { en: 'Lowercase only' } })
      );
      typeIdentifier('ABC');
      closeIdentifierPopup();
      submit(form);
      await waitFor(() => expect(errorMessages()).toEqual([subjectIdError('Lowercase only')]));
    });

    it("should log and accept an identifier when the group's pattern is not a valid regular expression, so a bad setting does not block every session", async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const form = renderForm([], groupWithIdPattern('['));
      typeIdentifier('abc');
      closeIdentifierPopup();
      await submitAndSettle(form);
      expect(consoleError).toHaveBeenCalledWith(expect.any(SyntaxError));
    });

    it('should ignore a lookup that resolves after the identifier has moved on, so stale details never overwrite newer ones', async () => {
      let resolveFirst!: (value: { data: { dateOfBirth: string; sex: string }; status: number }) => void;
      get.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
      );
      existingSubject({ dateOfBirth: '2000-01-01', sex: 'MALE' });
      const queryClient = createQueryClient();
      const fetchQuery = vi.spyOn(queryClient, 'fetchQuery');
      renderForm(['alpha', 'beta'], null, 'CUSTOM_ID', queryClient);
      pickIdentifier('alpha');
      pickIdentifier('beta');
      await waitFor(() => expect(dateOfBirthInput().value).toBe('2000-01-01'));
      const staleLookup = fetchQuery.mock.results[0]!.value;
      // The form awaited this promise first, so its continuation has run by the time this await returns.
      await act(async () => {
        resolveFirst({ data: { dateOfBirth: '1990-06-15T00:00:00.000Z', sex: 'FEMALE' }, status: 200 });
        await staleLookup;
      });
      expect(dateOfBirthInput().value).toBe('2000-01-01');
    });
  });

  describe('with personal information', () => {
    it('should identify the subject by a hash of their personal information, so no name is stored as an id', async () => {
      const form = renderForm([], null, 'PERSONAL_INFO');
      fillPersonalInfo(form, { dateOfBirth: '1990-06-15', firstName: 'Jane' });
      await submitAndSettle(form);
      const expectedId = await generateSubjectHash({
        dateOfBirth: new Date('1990-06-15'),
        firstName: 'Jane',
        lastName: 'Doe',
        sex: 'FEMALE'
      });
      expect(submittedSubjectId()).toBe(expectedId);
    });

    it('should require only the personal details left blank, so the clinician sees exactly what is missing', async () => {
      const form = renderForm([], null, 'PERSONAL_INFO');
      fillPersonalInfo(form, {});
      submit(form);
      await waitFor(() => {
        expect(errorMessages()).toEqual([
          { field: 'subjectFirstName', message: 'This field is required' },
          { field: 'subjectDateOfBirth', message: 'This field is required' }
        ]);
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should require every personal detail when the form is submitted empty', async () => {
      const form = renderForm([], null, 'PERSONAL_INFO');
      submit(form);
      await waitFor(() => {
        expect(errorMessages()).toEqual([
          { field: 'subjectFirstName', message: 'This field is required' },
          { field: 'subjectLastName', message: 'This field is required' },
          { field: 'subjectDateOfBirth', message: 'This field is required' },
          { field: 'subjectSex', message: 'This field is required' }
        ]);
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should reject a date of birth younger than the group's minimum age", async () => {
      const form = renderForm([], groupWithSettings({ minimumAge: 18 }), 'PERSONAL_INFO');
      fillPersonalInfo(form, { dateOfBirth: '2020-01-01', firstName: 'Jane' });
      submit(form);
      await waitFor(() => expect(screen.getByText('Subject must be above age of 18')).toBeTruthy());
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should accept a date of birth older than the group's minimum age", async () => {
      const form = renderForm([], groupWithSettings({ minimumAge: 18 }), 'PERSONAL_INFO');
      fillPersonalInfo(form, { dateOfBirth: '1990-06-15', firstName: 'Jane' });
      await submitAndSettle(form);
    });
  });

  describe('with custom fields', () => {
    const renderWithCustomFields = () => {
      return renderForm([], null, 'CUSTOM_FIELDS', createQueryClient(), customFieldsDefinition);
    };

    const fillCustomFields = (form: HTMLElement, values: [string, string]) => {
      values.forEach((value, index) => {
        fireEvent.change(form.querySelector(`[name="customField${index}"]`)!, { target: { value } });
      });
    };

    const methodOptions = (form: HTMLElement) => {
      const select = form.querySelector<HTMLSelectElement>('select[name="subjectIdentificationMethod"]')!;
      return Array.from(select.options, (option) => option.value).filter(Boolean);
    };

    const derivedId = () => deriveCustomFieldsSubjectId(['ab12', '7'], { iterations: 1000, salt: '0f'.repeat(32) });

    it('should offer the method only once its fields are defined', () => {
      expect(methodOptions(renderForm([]))).toStrictEqual(['CUSTOM_ID', 'PERSONAL_INFO']);
      cleanup();
      expect(methodOptions(renderWithCustomFields())).toStrictEqual(['CUSTOM_ID', 'PERSONAL_INFO', 'CUSTOM_FIELDS']);
    });

    it("should name the method with the administrator's label and ask for each of their fields", () => {
      renderWithCustomFields();
      expect(screen.getAllByText('Animal information').length).toBeGreaterThan(0);
      expect(screen.getByText('Animal ID')).toBeTruthy();
      expect(screen.getByText('Cage')).toBeTruthy();
    });

    it('should identify the subject by the id derived from the fields, sending no name', async () => {
      const form = renderWithCustomFields();
      fillCustomFields(form, ['ab12', '7']);
      await submitAndSettle(form);
      expect(onSubmit.mock.lastCall?.[0].subjectData).toStrictEqual({
        dateOfBirth: undefined,
        firstName: undefined,
        id: await derivedId(),
        lastName: undefined,
        sex: undefined
      });
    });

    it('should show the error of each field the values fail', async () => {
      const form = renderWithCustomFields();
      fillCustomFields(form, ['12', '']);
      submit(form);
      await waitFor(() => {
        expect(errorMessages()).toEqual([
          { field: 'customField0', message: 'Two letters, then digits' },
          { field: 'customField1', message: 'This field is required' }
        ]);
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should look the subject up by the derived id once every field is valid, and fill in and lock their details', async () => {
      existingSubject({ dateOfBirth: '1990-06-15', sex: 'FEMALE' });
      const form = renderWithCustomFields();
      fillCustomFields(form, ['ab12', '7']);
      await waitFor(() => expect(dateOfBirthInput().disabled).toBe(true));
      expect(get).toHaveBeenCalledWith(`/v1/subjects/${await derivedId()}`, expect.anything());
      expect(sexTrigger().disabled).toBe(true);
    });

    it('should not look anyone up while a field is still invalid', async () => {
      const form = renderWithCustomFields();
      fillCustomFields(form, ['12', '7']);
      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });
      });
      expect(get).not.toHaveBeenCalled();
    });
  });

  describe('session type', () => {
    it('should ask for the assessment date only for a retrospective session, since an in-person one happens today', () => {
      const form = renderForm([]);
      expect(screen.queryByText('Date Assessed')).toBeNull();
      fireEvent.change(form.querySelector('[name="sessionType"]')!, { target: { value: 'RETROSPECTIVE' } });
      expect(screen.getByText('Date Assessed')).toBeTruthy();
    });
  });

  describe('timing', () => {
    const DAY = 24 * 60 * 60 * 1000;

    const pageLoadedAt = Date.now();

    const toDateString = (time: number) => new Date(time).toISOString().slice(0, 10);

    const moveClock = (time: number) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(time);
    };

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should date an in-person session at submission, so a session started later in the same page load is not backdated to when the page opened', async () => {
      const startedAt = pageLoadedAt + 2 * 60 * 60 * 1000;
      const form = renderForm([]);
      typeIdentifier('abc');
      closeIdentifierPopup();
      moveClock(startedAt);
      await submitAndSettle(form);
      expect(onSubmit.mock.lastCall?.[0].date).toStrictEqual(new Date(startedAt));
    });

    it("should accept a date of birth that reaches the group's minimum age only after the page opened", async () => {
      const minimumAgeReachedAt = pageLoadedAt - 18 * 31556952000 + 5 * DAY;
      const form = renderForm([], groupWithSettings({ minimumAge: 18 }), 'PERSONAL_INFO');
      fillPersonalInfo(form, { dateOfBirth: toDateString(minimumAgeReachedAt), firstName: 'Jane' });
      moveClock(pageLoadedAt + 10 * DAY);
      await submitAndSettle(form);
    });
  });

  describe('retrospective session', () => {
    // A fixed local date a year ahead, so the picker opens on a known month and a date frozen when
    // the module loaded would lie before every time used here.
    const pageOpenedAt = new Date(new Date().getFullYear() + 1, 5, 15, 9, 0, 0);

    const chooseRetrospective = (form: HTMLElement) => {
      fireEvent.change(form.querySelector('[name="sessionType"]')!, { target: { value: 'RETROSPECTIVE' } });
    };

    const pickSessionDay = (day: number) => {
      fireEvent.click(screen.getByTestId('datetime-date-trigger'));
      fireEvent.click(getByText(screen.getByTestId('datepicker'), String(day)));
    };

    const enterSessionTime = (time: string) => {
      fireEvent.change(screen.getByTestId('datetime-time-input'), { target: { value: time } });
    };

    const renderWithNewIdentifier = () => {
      const form = renderForm([]);
      typeIdentifier('abc');
      closeIdentifierPopup();
      chooseRetrospective(form);
      return form;
    };

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(pageOpenedAt);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should submit the time of day entered for a retrospective session, so the collection time is kept', async () => {
      renderWithNewIdentifier();
      pickSessionDay(15);
      enterSessionTime('08:30:15');
      fireEvent.click(submitButton());
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(onSubmit.mock.lastCall?.[0]).toMatchObject({
        date: new Date(pageOpenedAt.getFullYear(), 5, 15, 8, 30, 15),
        type: 'RETROSPECTIVE'
      });
    });

    it('should accept a retrospective time later than when the page opened once that time has passed', async () => {
      renderWithNewIdentifier();
      pickSessionDay(15);
      enterSessionTime('10:30:00');
      vi.setSystemTime(new Date(pageOpenedAt.getFullYear(), 5, 15, 11, 0, 0));
      fireEvent.click(submitButton());
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });

    it('should reject a retrospective time that has not happened yet', async () => {
      renderWithNewIdentifier();
      pickSessionDay(15);
      enterSessionTime('10:30:00');
      fireEvent.click(submitButton());
      await waitFor(() => {
        expect(errorMessages()).toEqual([{ field: 'sessionDate', message: 'The assessment must be in the past' }]);
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should reject a retrospective session with no date, rather than dating it when the page loaded', async () => {
      renderWithNewIdentifier();
      enterSessionTime('08:30:00');
      fireEvent.click(submitButton());
      await waitFor(() => {
        expect(errorMessages()).toEqual([{ field: 'sessionDate', message: 'This field is required' }]);
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('date of birth', () => {
    const futureDateOfBirth = `${new Date().getFullYear() + 1}-01-01`;

    const futureDateOfBirthError = { field: 'subjectDateOfBirth', message: 'Date of birth must be in the past' };

    const enterNewIdentifier = () => {
      typeIdentifier('gamma');
      closeIdentifierPopup();
    };

    it('should reject a date of birth in the future, since no subject can be born after today', async () => {
      const form = renderForm([]);
      enterNewIdentifier();
      enterDateOfBirth(futureDateOfBirth);
      submit(form);
      await waitFor(() => expect(errorMessages()).toEqual([futureDateOfBirthError]));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show only the future-date error with personal information, not a contradictory required-field error', async () => {
      const form = renderForm([], null, 'PERSONAL_INFO');
      fillPersonalInfo(form, { dateOfBirth: futureDateOfBirth, firstName: 'Jane' });
      submit(form);
      await waitFor(() => expect(errorMessages()).toEqual([futureDateOfBirthError]));
    });

    it("should show only the future-date error in a group with a minimum age, not a second error for the subject's age", async () => {
      const form = renderForm([], groupWithSettings({ minimumAge: 18 }), 'PERSONAL_INFO');
      fillPersonalInfo(form, { dateOfBirth: futureDateOfBirth, firstName: 'Jane' });
      submit(form);
      await waitFor(() => expect(errorMessages()).toEqual([futureDateOfBirthError]));
    });

    it('should accept a date of birth in the past, so the check does not block a valid session', async () => {
      const form = renderForm([]);
      enterNewIdentifier();
      enterDateOfBirth('1990-01-01');
      await submitAndSettle(form);
      expect(onSubmit.mock.lastCall?.[0].subjectData.dateOfBirth).toStrictEqual(new Date('1990-01-01'));
    });
  });
});
