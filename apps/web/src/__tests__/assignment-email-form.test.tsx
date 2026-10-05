import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';
import type { EmailDeliveryResult } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssignmentEmailForm } from '@/components/AssignmentEmailForm';

import '@/services/i18n';

type SendEmailCallbacks = {
  onError: () => void;
  onSuccess: (result: EmailDeliveryResult) => void;
};

const mocks = vi.hoisted(() => ({
  isMailEnabled: true,
  isPending: false,
  sendEmail: vi.fn(),
  useGroupQuery: vi.fn()
}));

vi.mock('@/hooks/useGroupQuery', () => ({
  GROUP_QUERY_KEY: 'group',
  useGroupQuery: mocks.useGroupQuery
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { isMailEnabled: mocks.isMailEnabled } })
}));

vi.mock('@/hooks/useSendAssignmentEmailMutation', () => ({
  useSendAssignmentEmailMutation: () => ({ isPending: mocks.isPending, mutate: mocks.sendEmail })
}));

const assignment: Assignment = {
  completedAt: null,
  createdAt: new Date('2026-01-01'),
  expiresAt: new Date('2026-02-01'),
  groupId: 'group-of-the-assignment',
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  updatedAt: new Date('2026-01-01'),
  url: 'https://gateway.example.org/a/1'
};

const frenchOnlyTemplate: GroupEmailTemplate = {
  body: { fr: 'Lien {{url}}' },
  id: 'tpl-fr',
  name: 'Rappel',
  subject: { fr: 'Objet' }
};

const englishTemplate: GroupEmailTemplate = {
  body: { en: 'Link {{url}}' },
  id: 'tpl-en',
  name: 'Reminder',
  subject: { en: 'Subject' }
};

const mockGroup = (activeAssignmentEmailTemplateId: null | string, emailTemplates: GroupEmailTemplate[]) => {
  mocks.useGroupQuery.mockReturnValue({ data: { activeAssignmentEmailTemplateId, emailTemplates }, isLoading: false });
};

const respondToSend = (respond: (callbacks: SendEmailCallbacks) => void) => {
  mocks.sendEmail.mockImplementation((_variables: unknown, callbacks: SendEmailCallbacks) => respond(callbacks));
};

const submit = (recipient: string) => {
  fireEvent.change(screen.getByTestId('assignment-email'), { target: { value: recipient } });
  fireEvent.click(screen.getByTestId('assignment-email-submit'));
};

const openTemplates = () => fireEvent.keyDown(screen.getByTestId('assignment-template'), { key: 'Enter' });

const chooseTemplate = (label: string) => {
  openTemplates();
  fireEvent.click(screen.getByRole('option', { name: label }));
};

const lastNotification = () => useNotificationsStore.getState().notifications.at(-1);

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
  vi.clearAllMocks();
  i18n.changeLanguage('en');
  mocks.isMailEnabled = true;
  mocks.isPending = false;
  useNotificationsStore.setState({ notifications: [] });
  mockGroup(null, []);
});

describe('AssignmentEmailForm', () => {
  // The server resolves the template from the assignment's own group; querying the currently
  // selected group instead would offer templates the server will never consider.
  it('queries the group the assignment belongs to', () => {
    render(<AssignmentEmailForm assignment={assignment} />);
    expect(mocks.useGroupQuery).toHaveBeenCalledWith('group-of-the-assignment');
  });

  it('renders nothing when mail is disabled', () => {
    mocks.isMailEnabled = false;
    render(<AssignmentEmailForm assignment={assignment} />);
    expect(screen.queryByTestId('assignment-email-form')).toBeNull();
  });

  it('does not query a group when mail is disabled', () => {
    mocks.isMailEnabled = false;
    render(<AssignmentEmailForm assignment={assignment} />);
    expect(mocks.useGroupQuery).toHaveBeenCalledWith(null);
  });

  it('sends the recipient and the built-in default template', () => {
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({
      assignmentId: 'assignment-1',
      recipient: 'p@x.org',
      templateId: null
    });
  });

  // The dropdown is rebuilt from the selected template's languages on every render, so an
  // initial 'en' must not survive into the request when only French is on offer.
  it('posts a language the selected template is actually authored in', () => {
    mockGroup('tpl-fr', [frenchOnlyTemplate]);
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({ language: 'fr', templateId: 'tpl-fr' });
  });

  it('restricts the language to those the instrument supports', () => {
    render(<AssignmentEmailForm assignment={assignment} instrumentLanguages={['fr']} />);
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({ language: 'fr' });
  });

  it('does not send without a recipient', () => {
    render(<AssignmentEmailForm assignment={assignment} />);
    fireEvent.click(screen.getByTestId('assignment-email-submit'));
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('should not send before an assignment exists, since there is no link to email yet', () => {
    render(<AssignmentEmailForm assignment={null} />);
    submit('p@x.org');
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('should fall back to English when the template and the instrument share no language, rather than posting nothing', () => {
    mockGroup('tpl-fr', [frenchOnlyTemplate]);
    render(<AssignmentEmailForm assignment={assignment} instrumentLanguages={['en']} />);
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({ language: 'en' });
  });

  it('should offer every language when the active template is missing from the group, so the form stays usable', () => {
    mockGroup('tpl-deleted', [frenchOnlyTemplate]);
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({ language: 'en', templateId: 'tpl-deleted' });
  });

  it('should hide the template picker when the group has no templates of its own', () => {
    render(<AssignmentEmailForm assignment={assignment} />);
    expect(screen.queryByTestId('assignment-template')).toBeNull();
  });

  it('should treat a group without a templates list as having none', () => {
    mocks.useGroupQuery.mockReturnValue({ data: { activeAssignmentEmailTemplateId: null }, isLoading: false });
    render(<AssignmentEmailForm assignment={assignment} />);
    expect(screen.queryByTestId('assignment-template')).toBeNull();
  });

  it("should list the group's active template first, so the default choice is the obvious one", () => {
    mockGroup('tpl-en', [frenchOnlyTemplate, englishTemplate]);
    render(<AssignmentEmailForm assignment={assignment} />);
    openTemplates();
    const labels = screen.getAllByRole('option').map((option) => option.textContent);
    expect(labels).toEqual(['Reminder', 'Built-in default', 'Rappel']);
  });

  it('should post the template the user chose instead of the active one', () => {
    mockGroup(null, [frenchOnlyTemplate, englishTemplate]);
    render(<AssignmentEmailForm assignment={assignment} />);
    chooseTemplate('Reminder');
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({ templateId: 'tpl-en' });
  });

  it('should post no template id when the built-in default is chosen over an active group template', () => {
    mockGroup('tpl-en', [englishTemplate]);
    render(<AssignmentEmailForm assignment={assignment} />);
    chooseTemplate('Built-in default');
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({ templateId: null });
  });

  it('should post the language the user chose', () => {
    render(<AssignmentEmailForm assignment={assignment} />);
    fireEvent.keyDown(screen.getByTestId('assignment-language'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('option', { name: 'French' }));
    submit('p@x.org');
    expect(mocks.sendEmail.mock.lastCall?.[0]).toMatchObject({ language: 'fr' });
  });

  it('should disable sending while the group is loading, so the built-in default is not posted by accident', () => {
    mocks.useGroupQuery.mockReturnValue({ data: undefined, isLoading: true });
    render(<AssignmentEmailForm assignment={assignment} />);
    fireEvent.change(screen.getByTestId('assignment-email'), { target: { value: 'p@x.org' } });
    expect(screen.getByTestId<HTMLButtonElement>('assignment-email-submit').disabled).toBe(true);
  });

  it('should disable sending and say so while an email is in flight, so it is not sent twice', () => {
    mocks.isPending = true;
    render(<AssignmentEmailForm assignment={assignment} />);
    fireEvent.change(screen.getByTestId('assignment-email'), { target: { value: 'p@x.org' } });
    const button = screen.getByTestId<HTMLButtonElement>('assignment-email-submit');
    expect([button.disabled, button.textContent]).toEqual([true, 'Sending…']);
  });

  it('should confirm a sent email inline with the recipient', () => {
    respondToSend(({ onSuccess }) => onSuccess({ message: 'ok', status: 'SENT' }));
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    const feedback = screen.getByTestId('assignment-email-feedback');
    expect([feedback.textContent, feedback.className]).toEqual([
      'Assignment link sent to p@x.org',
      'text-xs font-medium'
    ]);
  });

  it('should raise a success notification once the email is sent', () => {
    respondToSend(({ onSuccess }) => onSuccess({ message: 'ok', status: 'SENT' }));
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(lastNotification()).toMatchObject({ title: 'Email sent', type: 'success' });
  });

  it('should clear the recipient once the email is sent, so the next participant starts from a blank field', () => {
    respondToSend(({ onSuccess }) => onSuccess({ message: 'ok', status: 'SENT' }));
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(screen.getByTestId<HTMLInputElement>('assignment-email').value).toBe('');
  });

  it('should explain a delivery failure using the code the server returned', () => {
    respondToSend(({ onSuccess }) => onSuccess({ error: 'AUTHENTICATION_FAILED', message: 'no', status: 'FAILED' }));
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(screen.getByTestId('assignment-email-feedback').textContent).toBe(
      'Authentication failed — check the username and password.'
    );
  });

  it('should keep the recipient after a delivery failure, so the user can retry without retyping it', () => {
    respondToSend(({ onSuccess }) => onSuccess({ error: 'UNKNOWN', message: 'no', status: 'FAILED' }));
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(screen.getByTestId<HTMLInputElement>('assignment-email').value).toBe('p@x.org');
  });

  it('should report a failed request inline as an error', () => {
    respondToSend(({ onError }) => onError());
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    const feedback = screen.getByTestId('assignment-email-feedback');
    expect([feedback.textContent, feedback.className]).toEqual([
      'The email could not be sent',
      'text-destructive text-xs font-medium'
    ]);
  });

  it('should raise an error notification when the request fails', () => {
    respondToSend(({ onError }) => onError());
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    expect(lastNotification()).toMatchObject({
      message: 'The email could not be sent',
      title: 'Email failed',
      type: 'error'
    });
  });

  it('should clear stale feedback when sending again, so an old result is not mistaken for the new one', () => {
    respondToSend(({ onError }) => onError());
    render(<AssignmentEmailForm assignment={assignment} />);
    submit('p@x.org');
    mocks.sendEmail.mockImplementation(() => undefined);
    submit('q@x.org');
    expect(screen.queryByTestId('assignment-email-feedback')).toBeNull();
  });
});
