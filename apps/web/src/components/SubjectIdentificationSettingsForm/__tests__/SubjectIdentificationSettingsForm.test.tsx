import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type {
  $UpdateSubjectIdentificationSettingsData,
  SubjectIdentificationSettings
} from '@opendatacapture/schemas/subject-identification';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SubjectIdentificationSettingsForm } from '../SubjectIdentificationSettingsForm';

import '@/services/i18n';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));

vi.mock('axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('axios')>()),
  default: mockAxios
}));

const SALT = 'ab'.repeat(32);

const storedSettings = (overrides: Partial<SubjectIdentificationSettings> = {}): SubjectIdentificationSettings => ({
  customFields: {
    fields: [{ label: { en: 'Animal ID' }, pattern: '[0-9]+' }],
    iterations: 600_000,
    label: { en: 'Animal information' },
    salt: SALT
  },
  isCustomFieldsLocked: false,
  ...overrides
});

const unsetSettings: SubjectIdentificationSettings = { customFields: null, isCustomFieldsLocked: false };

const conflictError = () => {
  return new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data: {},
    headers: {},
    status: 409,
    statusText: 'Conflict'
  });
};

const renderForm = (settings: SubjectIdentificationSettings) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <SubjectIdentificationSettingsForm activeLanguages={['en', 'fr']} settings={settings} />
    </QueryClientProvider>
  );
};

const click = (testId: string) => fireEvent.click(screen.getByTestId(testId));
const type = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } });
const lastPutBody = (): unknown => mockAxios.put.mock.lastCall?.[1];
const lastNotification = () => useNotificationsStore.getState().notifications.at(-1);

const defineOneField = () => {
  click('custom-fields-define');
  type('custom-fields-label-en', 'Animal information');
  type('custom-field-0-label-en', 'Animal ID');
  type('custom-field-0-pattern', '[0-9]+');
};

describe('SubjectIdentificationSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.put.mockImplementation((_url, { customFields }: $UpdateSubjectIdentificationSettingsData) => {
      const saved = customFields && { ...customFields, iterations: 600_000, salt: SALT };
      return Promise.resolve({ data: { customFields: saved, isCustomFieldsLocked: false } });
    });
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(cleanup);

  describe('the first definition', () => {
    it('should ask for confirmation before saving, since the field list is fixed once a subject is identified', () => {
      renderForm(unsetSettings);
      defineOneField();
      click('subject-identification-save');
      expect(screen.getByTestId('subject-identification-confirm-dialog')).toBeTruthy();
      expect(mockAxios.put).not.toHaveBeenCalled();
    });

    it('should save the definition once confirmed', async () => {
      renderForm(unsetSettings);
      defineOneField();
      click('subject-identification-save');
      click('subject-identification-confirm-save');
      await waitFor(() => expect(lastNotification()?.type).toBe('success'));
      expect(lastPutBody()).toStrictEqual({
        customFields: {
          fields: [{ description: null, label: { en: 'Animal ID' }, pattern: '[0-9]+', patternErrorMessage: null }],
          label: { en: 'Animal information' }
        }
      });
    });

    it('should not save when the confirmation is cancelled', () => {
      renderForm(unsetSettings);
      defineOneField();
      click('subject-identification-save');
      click('subject-identification-cancel-save');
      expect(screen.queryByTestId('subject-identification-confirm-dialog')).toBeNull();
      expect(mockAxios.put).not.toHaveBeenCalled();
    });

    it('should save without confirmation while still no definition is drafted', async () => {
      renderForm(unsetSettings);
      click('subject-identification-save');
      await waitFor(() => expect(lastPutBody()).toStrictEqual({ customFields: null }));
    });
  });

  describe('an incomplete definition', () => {
    it('should not save it, and flag what is missing', () => {
      renderForm(unsetSettings);
      click('custom-fields-define');
      click('subject-identification-save');
      expect(screen.getByTestId('subject-identification-invalid')).toBeTruthy();
      expect(screen.getByTestId('custom-fields-label-error')).toBeTruthy();
      expect(screen.getByTestId('custom-field-0-label-error')).toBeTruthy();
      expect(screen.queryByTestId('subject-identification-confirm-dialog')).toBeNull();
      expect(mockAxios.put).not.toHaveBeenCalled();
    });

    it('should stop flagging missing entries once a save succeeds, so a field added later starts clean', async () => {
      renderForm(storedSettings());
      type('custom-fields-label-en', '');
      click('subject-identification-save');
      type('custom-fields-label-en', 'Mouse');
      click('subject-identification-save');
      await waitFor(() => expect(lastNotification()?.type).toBe('success'));
      click('custom-fields-add-field');
      expect(screen.queryByTestId('custom-field-1-label-error')).toBeNull();
    });
  });

  describe('a stored definition', () => {
    it('should save an edit without asking for confirmation', async () => {
      renderForm(storedSettings());
      type('custom-field-0-label-fr', "ID de l'animal");
      click('subject-identification-save');
      await waitFor(() => expect(lastNotification()?.type).toBe('success'));
      expect(screen.queryByTestId('subject-identification-confirm-dialog')).toBeNull();
      expect(lastPutBody()).toMatchObject({
        customFields: { fields: [{ label: { en: 'Animal ID', fr: "ID de l'animal" } }] }
      });
    });

    it('should save a removed definition as null', async () => {
      renderForm(storedSettings());
      click('custom-fields-remove');
      click('subject-identification-save');
      await waitFor(() => expect(lastPutBody()).toStrictEqual({ customFields: null }));
    });

    it('should not offer a second save while one is in flight', async () => {
      // A save that never settles holds the form in flight for the whole test.
      mockAxios.put.mockReturnValue(Promise.race([]));
      renderForm(storedSettings());
      click('subject-identification-save');
      await waitFor(() => {
        expect(screen.getByTestId<HTMLButtonElement>('subject-identification-save').disabled).toBe(true);
      });
    });
  });

  describe('a failed save', () => {
    it('should say the changes were not saved and keep them', async () => {
      mockAxios.put.mockRejectedValue(new Error('Network Error'));
      renderForm(storedSettings());
      type('custom-field-0-label-en', 'Mouse ID');
      click('subject-identification-save');
      await waitFor(() => expect(lastNotification()?.type).toBe('error'));
      expect(screen.getByTestId<HTMLInputElement>('custom-field-0-label-en').value).toBe('Mouse ID');
    });

    // A conflict means a subject was identified with the fields after the page loaded, so the field
    // list in the draft can never be saved and the lock must now show.
    it('should reload the saved definition when the fields locked while they were being edited', async () => {
      mockAxios.put.mockRejectedValue(conflictError());
      mockAxios.get.mockResolvedValue({ data: storedSettings({ isCustomFieldsLocked: true }) });
      renderForm(storedSettings());
      click('custom-fields-add-field');
      type('custom-field-1-label-en', 'Cage');
      type('custom-field-1-pattern', '[0-9]+');
      click('subject-identification-save');
      await waitFor(() => expect(screen.queryByTestId('custom-field-1')).toBeNull());
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/subjects/identification/settings');
      expect(lastNotification()?.type).toBe('error');
    });
  });
});
