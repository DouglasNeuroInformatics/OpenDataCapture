import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Group } from '@opendatacapture/schemas/group';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdentificationForm } from '../IdentificationForm';

import '@/services/i18n';

const store = vi.hoisted(() => {
  const state: { currentGroup: Group | null } = { currentGroup: null };
  return state;
});

const subjectUtils = vi.hoisted(() => ({ generateSubjectHash: vi.fn() }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector: (state: typeof store) => unknown) => selector(store))
}));

vi.mock('@opendatacapture/subject-utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@opendatacapture/subject-utils')>()),
  generateSubjectHash: subjectUtils.generateSubjectHash
}));

const createGroup = (defaultIdentificationMethod: SubjectIdentificationMethod): Group => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Memory Clinic',
  settings: { defaultIdentificationMethod },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02'),
  userIds: []
});

const renderForm = () => {
  const onSubmit = vi.fn();
  render(<IdentificationForm onSubmit={onSubmit} />);
  return onSubmit;
};

const field = (name: string) => screen.getByTestId('identification-form').querySelector(`[name="${name}"]`);

const setField = (name: string, value: string) => {
  fireEvent.change(field(name)!, { target: { value } });
};

/** The date field commits what was typed only once the input loses focus. */
const setDateOfBirth = (value: string) => {
  const input = screen.getByTestId('date-input');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
};

const submit = () => {
  fireEvent.click(screen.getByLabelText('Submit'));
};

const fieldsWithErrors = () =>
  screen
    .queryAllByTestId('error-message-text')
    .map((element) => element.closest('[data-field-group]')?.getAttribute('data-field-group'));

describe('IdentificationForm', () => {
  beforeEach(() => {
    void i18n.changeLanguage('en');
    store.currentGroup = null;
    subjectUtils.generateSubjectHash.mockResolvedValue('subject-hash');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should ask for personal details by default when no group is selected', () => {
    renderForm();
    expect(['firstName', 'lastName', 'dateOfBirth', 'sex'].every((name) => field(name))).toBe(true);
  });

  it('should not ask for an identifier when identifying by personal details', () => {
    renderForm();
    expect(field('id')).toBeNull();
  });

  it('should default to the identification method the current group prefers', () => {
    store.currentGroup = createGroup('CUSTOM_ID');
    renderForm();
    expect(field('id')).toBeTruthy();
  });

  it('should not ask for personal details when identifying by custom identifier', () => {
    store.currentGroup = createGroup('CUSTOM_ID');
    renderForm();
    expect(['firstName', 'lastName', 'dateOfBirth', 'sex'].some((name) => field(name))).toBe(false);
  });

  it('should require an identifier when identifying by custom identifier', async () => {
    store.currentGroup = createGroup('CUSTOM_ID');
    const onSubmit = renderForm();
    submit();
    await waitFor(() => expect(fieldsWithErrors()).toEqual(['id']));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should scope a custom identifier to the current group, so equal identifiers in two groups name two subjects', async () => {
    store.currentGroup = createGroup('CUSTOM_ID');
    const onSubmit = renderForm();
    setField('id', 'subject-7');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ id: 'Memory_Clinic$subject-7' }));
  });

  it('should scope a custom identifier to the root group when no group is selected', async () => {
    const onSubmit = renderForm();
    setField('identificationMethod', 'CUSTOM_ID');
    setField('id', 'subject-7');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ id: 'root$subject-7' }));
  });

  it('should require every personal detail when identifying by personal details', async () => {
    const onSubmit = renderForm();
    submit();
    await waitFor(() => expect(fieldsWithErrors()).toEqual(['firstName', 'lastName', 'dateOfBirth', 'sex']));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should identify a subject by the hash of their personal details', async () => {
    const onSubmit = renderForm();
    setField('firstName', 'Jane');
    setField('lastName', 'Doe');
    setDateOfBirth('1990-06-15');
    setField('sex', 'FEMALE');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ id: 'subject-hash' }));
    expect(subjectUtils.generateSubjectHash).toHaveBeenCalledWith({
      dateOfBirth: new Date('1990-06-15'),
      firstName: 'Jane',
      lastName: 'Doe',
      sex: 'FEMALE'
    });
  });
});
