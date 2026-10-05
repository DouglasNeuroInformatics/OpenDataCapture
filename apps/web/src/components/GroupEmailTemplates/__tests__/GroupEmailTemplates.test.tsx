import type { PropsWithChildren } from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { $UpdateGroupData, Group, GroupEmailTemplate } from '@opendatacapture/schemas/group';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupEmailTemplates } from '../GroupEmailTemplates';

import '@/services/i18n';

const mockAxios = vi.hoisted(() => ({
  get: vi.fn<(url: string) => Promise<{ data: Group }>>(),
  patch: vi.fn<(url: string, data: $UpdateGroupData) => Promise<{ data: unknown }>>()
}));
const store = vi.hoisted(() => ({ currentGroup: null as null | { id: string } }));

vi.mock('axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('axios')>()),
  default: mockAxios
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector: (state: typeof store) => unknown) => selector(store))
}));

const reminder: GroupEmailTemplate = {
  body: { en: 'Open {{url}} before {{expiresAt}}' },
  id: 'tpl-a',
  name: 'Reminder',
  subject: { en: 'Please complete' }
};

const followUp: GroupEmailTemplate = {
  body: { en: 'Still waiting: {{url}} until {{expiresAt}}' },
  id: 'tpl-b',
  name: 'Follow-up',
  subject: { en: 'Friendly reminder', es: '' }
};

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  accessibleInstrumentIds: [],
  activeAssignmentEmailTemplateId: 'tpl-b',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  emailTemplates: [reminder, followUp],
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group 1',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  userIds: [],
  ...overrides
});

const conflictError = () =>
  new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data: {},
    headers: {},
    status: 409,
    statusText: 'Conflict'
  });

const serveGroup = (group: Group) => {
  mockAxios.get.mockResolvedValue({ data: group });
  mockAxios.patch.mockImplementation((_url, data) =>
    Promise.resolve({ data: { ...group, ...data, updatedAt: new Date('2026-01-03T00:00:00.000Z') } })
  );
};

const renderTemplates = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  render(<GroupEmailTemplates />, { wrapper: Wrapper });
};

const renderLoaded = async (group = makeGroup()) => {
  serveGroup(group);
  renderTemplates();
  await screen.findByTestId(`template-active-${group.activeAssignmentEmailTemplateId ?? 'builtin'}`);
};

const lastPatch = () => mockAxios.patch.mock.lastCall?.[1];

const notifications = () => useNotificationsStore.getState().notifications;

const fillCreateForm = (name: string, subject: string, body: string) => {
  fireEvent.change(screen.getByTestId('template-name'), { target: { value: name } });
  fireEvent.change(screen.getByTestId('template-create-subject'), { target: { value: subject } });
  fireEvent.change(screen.getByTestId('template-create-body'), { target: { value: body } });
};

const createEnglishTemplate = (name: string) => {
  fillCreateForm(name, 'New subject', 'Go to {{url}} by {{expiresAt}}');
  fireEvent.click(screen.getByTestId('template-create-submit'));
  fireEvent.click(screen.getByTestId('template-create-anyway'));
};

describe('GroupEmailTemplates', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    vi.clearAllMocks();
    store.currentGroup = { id: 'group-1' };
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(cleanup);

  it('should ask for a group instead of rendering an editor that could not save anywhere', () => {
    store.currentGroup = null;
    renderTemplates();
    expect(screen.getByTestId('group-email-templates').textContent).toBe(
      'Select a group to manage its email templates.'
    );
    expect(screen.queryByTestId('template-create-form')).toBeNull();
  });

  it('should offer the built-in message as the default when the group has no custom templates', async () => {
    await renderLoaded(makeGroup({ activeAssignmentEmailTemplateId: undefined, emailTemplates: undefined }));
    expect(screen.getByText(/No custom templates yet/)).toBeTruthy();
    expect(screen.getAllByTestId('template-row')).toHaveLength(1);
  });

  it('should list every custom template and mark the active one as the default', async () => {
    await renderLoaded();
    expect(screen.getAllByTestId('template-row').map((row) => row.firstChild?.textContent)).toEqual([
      'Your Open Data Capture Assignment (built-in)',
      'Reminder',
      'Follow-up'
    ]);
    expect(screen.getByTestId('template-active-tpl-b')).toBeTruthy();
  });

  it('should show the built-in message when it is viewed', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-view-builtin'));
    expect(screen.getByText('Built-in default template')).toBeTruthy();
  });

  it('should save a new default against the revision it was composed on, so concurrent edits conflict', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-set-active-tpl-a'));
    await waitFor(() => expect(mockAxios.patch).toHaveBeenCalledOnce());
    expect(lastPatch()).toMatchObject({
      activeAssignmentEmailTemplateId: 'tpl-a',
      expectedUpdatedAt: makeGroup().updatedAt
    });
  });

  it('should show the saved default from the response without waiting for a refetch', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-set-active-tpl-a'));
    expect(await screen.findByTestId('template-active-tpl-a')).toBeTruthy();
    expect(mockAxios.get).toHaveBeenCalledOnce();
    expect(notifications()).toMatchObject([{ type: 'success' }]);
  });

  it('should restore the built-in message as the default when chosen', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-set-active-builtin'));
    await waitFor(() => expect(mockAxios.patch).toHaveBeenCalledOnce());
    expect(lastPatch()?.activeAssignmentEmailTemplateId).toBeNull();
  });

  it('should drop blank translations before saving, so no empty language reaches the API', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-set-active-builtin'));
    await waitFor(() => expect(mockAxios.patch).toHaveBeenCalledOnce());
    expect(lastPatch()?.emailTemplates?.[1]?.subject).toEqual({ en: 'Friendly reminder' });
  });

  it('should ask for both fields in a language before anything is written in it', async () => {
    await renderLoaded();
    expect(screen.getByTestId('template-create-error').textContent).toBe(
      'Fill in the subject and body in each language you have started.'
    );
  });

  it('should require the link and expiry placeholders in the body', async () => {
    await renderLoaded();
    fillCreateForm('Notice', 'Subject', 'A body without placeholders');
    expect(screen.getByTestId('template-create-error').textContent).toBe(
      'The body must include {{url}} and {{expiresAt}}.'
    );
  });

  it('should accept content that has both fields and both placeholders', async () => {
    await renderLoaded();
    fillCreateForm('Notice', 'Subject', 'Go to {{url}} by {{expiresAt}}');
    expect(screen.queryByTestId('template-create-error')).toBeNull();
  });

  it('should reject a blank name', async () => {
    await renderLoaded();
    fillCreateForm('   ', 'Subject', 'Go to {{url}} by {{expiresAt}}');
    fireEvent.click(screen.getByTestId('template-create-submit'));
    expect(notifications()).toMatchObject([{ message: 'A name is required', type: 'error' }]);
  });

  it('should reject a name already used by another template, ignoring case', async () => {
    await renderLoaded();
    fillCreateForm('reminder', 'Subject', 'Go to {{url}} by {{expiresAt}}');
    fireEvent.click(screen.getByTestId('template-create-submit'));
    expect(notifications()).toMatchObject([{ message: 'A template with this name already exists', type: 'error' }]);
  });

  it('should append a new template without changing which one is the default', async () => {
    await renderLoaded();
    createEnglishTemplate('Notice');
    await waitFor(() => expect(mockAxios.patch).toHaveBeenCalledOnce());
    expect(lastPatch()?.activeAssignmentEmailTemplateId).toBe('tpl-b');
    expect(lastPatch()?.emailTemplates?.[2]).toEqual({
      body: { en: 'Go to {{url}} by {{expiresAt}}' },
      id: expect.any(String),
      name: 'Notice',
      subject: { en: 'New subject' }
    });
  });

  it('should refuse to save before the group has loaded, rather than appear to succeed', async () => {
    mockAxios.get.mockReturnValue(new Promise(() => undefined));
    renderTemplates();
    createEnglishTemplate('Notice');
    await waitFor(() =>
      expect(notifications()).toMatchObject([
        { message: 'The group is still loading — try again in a moment.', type: 'error' }
      ])
    );
    expect(mockAxios.patch).not.toHaveBeenCalled();
  });

  it('should save an edited template in place and close the editor', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-edit-tpl-a'));
    fireEvent.change(screen.getByTestId('template-edit-subject'), { target: { value: 'Updated subject' } });
    fireEvent.click(screen.getByTestId('template-edit-save'));
    await waitFor(() => expect(screen.queryByTestId('template-edit-name')).toBeNull());
    expect(lastPatch()?.emailTemplates?.map((template) => template.subject)).toEqual([
      { en: 'Updated subject' },
      { en: 'Friendly reminder' }
    ]);
  });

  it('should reject renaming a template to the name of another', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-edit-tpl-a'));
    fireEvent.change(screen.getByTestId('template-edit-name'), { target: { value: 'Follow-up' } });
    fireEvent.click(screen.getByTestId('template-edit-save'));
    expect(notifications()).toMatchObject([{ message: 'A template with this name already exists', type: 'error' }]);
  });

  it('should keep the editor open when the edit fails to save, so the changes are not lost', async () => {
    await renderLoaded();
    mockAxios.patch.mockRejectedValue(new Error('Network Error'));
    fireEvent.click(screen.getByTestId('template-edit-tpl-a'));
    fireEvent.click(screen.getByTestId('template-edit-save'));
    await waitFor(() => expect(notifications()).toHaveLength(1));
    expect(screen.getByTestId('template-edit-name')).toBeTruthy();
  });

  it('should close the editor without saving when cancelled', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-edit-tpl-a'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('template-edit-name')).toBeNull();
    expect(mockAxios.patch).not.toHaveBeenCalled();
  });

  it('should delete a template that is not the default and leave the default alone', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-delete-tpl-a'));
    fireEvent.click(screen.getByTestId('template-delete-confirm'));
    await waitFor(() => expect(screen.queryByTestId('template-delete-confirm')).toBeNull());
    expect(lastPatch()).toMatchObject({
      activeAssignmentEmailTemplateId: 'tpl-b',
      emailTemplates: [{ ...followUp, subject: { en: 'Friendly reminder' } }]
    });
    expect(notifications()).toMatchObject([{ type: 'success' }]);
  });

  it('should fall back to the built-in message and say so when the default template is deleted', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-delete-tpl-b'));
    fireEvent.click(screen.getByTestId('template-delete-confirm'));
    await waitFor(() => expect(notifications()).toHaveLength(2));
    expect(lastPatch()?.activeAssignmentEmailTemplateId).toBeNull();
    expect(notifications()[1]).toMatchObject({
      message: 'That was the default template, so the built-in message is now used.',
      type: 'info'
    });
  });

  it('should keep the delete dialog open when the deletion fails to save', async () => {
    await renderLoaded();
    mockAxios.patch.mockRejectedValue(new Error('Network Error'));
    fireEvent.click(screen.getByTestId('template-delete-tpl-a'));
    fireEvent.click(screen.getByTestId('template-delete-confirm'));
    await waitFor(() => expect(notifications()).toHaveLength(1));
    expect(screen.getByTestId('template-delete-confirm')).toBeTruthy();
  });

  it('should close the delete dialog without deleting when cancelled', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByTestId('template-delete-tpl-a'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('template-delete-confirm')).toBeNull();
    expect(mockAxios.patch).not.toHaveBeenCalled();
  });

  it('should explain a failed save as a connection problem when it was not a conflict', async () => {
    await renderLoaded();
    mockAxios.patch.mockRejectedValue(new Error('Network Error'));
    fireEvent.click(screen.getByTestId('template-set-active-tpl-a'));
    await waitFor(() =>
      expect(notifications()).toMatchObject([
        {
          message: 'Your changes were not saved. Check your connection and try again.',
          title: 'Save failed',
          type: 'error'
        }
      ])
    );
    expect(mockAxios.get).toHaveBeenCalledOnce();
  });

  it('should explain a conflict as a concurrent edit by someone else', async () => {
    await renderLoaded();
    mockAxios.patch.mockRejectedValue(conflictError());
    fireEvent.click(screen.getByTestId('template-set-active-tpl-a'));
    await waitFor(() =>
      expect(notifications()).toMatchObject([
        {
          message:
            'Someone else changed these templates while you were editing. Your changes were not saved — reload the page and try again.',
          title: 'Save failed',
          type: 'error'
        }
      ])
    );
  });

  it('should refetch the group after a conflict, so the next edit is composed on the latest revision', async () => {
    await renderLoaded();
    mockAxios.patch.mockRejectedValue(conflictError());
    fireEvent.click(screen.getByTestId('template-set-active-tpl-a'));
    await waitFor(() => expect(mockAxios.get).toHaveBeenCalledTimes(2));
  });
});
