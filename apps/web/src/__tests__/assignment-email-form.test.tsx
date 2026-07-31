import type { Assignment } from '@opendatacapture/schemas/assignment';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssignmentEmailForm } from '@/components/AssignmentEmailForm';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  isMailEnabled: true,
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
  useSendAssignmentEmailMutation: () => ({ isPending: false, mutate: mocks.sendEmail })
}));

const assignment = {
  groupId: 'group-of-the-assignment',
  id: 'assignment-1',
  url: 'https://gateway.example.org/a/1'
} as Assignment;

const frenchOnlyTemplate = {
  body: { fr: 'Lien {{url}}' },
  id: 'tpl-fr',
  name: 'Rappel',
  subject: { fr: 'Objet' }
};

const submit = (recipient: string) => {
  fireEvent.change(screen.getByTestId('assignment-email'), { target: { value: recipient } });
  fireEvent.click(screen.getByTestId('assignment-email-submit'));
};

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
  vi.clearAllMocks();
  mocks.isMailEnabled = true;
  mocks.useGroupQuery.mockReturnValue({ data: { activeAssignmentEmailTemplateId: null, emailTemplates: [] } });
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
    mocks.useGroupQuery.mockReturnValue({
      data: { activeAssignmentEmailTemplateId: 'tpl-fr', emailTemplates: [frenchOnlyTemplate] }
    });
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
});
