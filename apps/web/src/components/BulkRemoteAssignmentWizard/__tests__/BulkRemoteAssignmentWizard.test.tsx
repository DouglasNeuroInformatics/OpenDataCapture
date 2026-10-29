import React from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import type { Language } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { SetupState } from '@opendatacapture/schemas/setup';
import type { Subject } from '@opendatacapture/schemas/subject';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBulkAssignmentWizard } from '@/hooks/useBulkAssignmentWizard';
import { useGroupQuery } from '@/hooks/useGroupQuery';
import { useSendBulkAssignmentEmailMutation } from '@/hooks/useSendBulkAssignmentEmailMutation';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import type { BulkParseResult } from '@/utils/bulk-assignments';

import { BulkRemoteAssignmentWizard } from '../BulkRemoteAssignmentWizard';
import { MapStep } from '../MapStep';
import { ReviewStep } from '../ReviewStep';
import { SourceStep } from '../SourceStep';
import { TimepointsStep } from '../TimepointsStep';

import type { WizardStep } from '../types';

import '@/services/i18n';

vi.mock('@/hooks/useBulkAssignmentWizard', () => ({ useBulkAssignmentWizard: vi.fn() }));
vi.mock('@/hooks/useSetupStateQuery', () => ({ useSetupStateQuery: vi.fn() }));
vi.mock('@/hooks/useGroupQuery', () => ({ useGroupQuery: vi.fn() }));
vi.mock('@/hooks/useSendBulkAssignmentEmailMutation', () => ({ useSendBulkAssignmentEmailMutation: vi.fn() }));
vi.mock('../MapStep', () => ({ MapStep: vi.fn(() => <div data-testid="map-step" />) }));
vi.mock('../ReviewStep', () => ({ ReviewStep: vi.fn(() => <div data-testid="review-step" />) }));
vi.mock('../SourceStep', () => ({ SourceStep: vi.fn(() => <div data-testid="source-step" />) }));
vi.mock('../TimepointsStep', () => ({ TimepointsStep: vi.fn(() => <div data-testid="timepoints-step" />) }));

type Wizard = ReturnType<typeof useBulkAssignmentWizard>;

const parsed: BulkParseResult = {
  headers: ['subject_id'],
  mapping: { subject_id: 'subjectId' },
  mode: 'ID',
  preview: [{ subject_id: '001' }],
  rows: [{ subject_id: '001' }, { subject_id: '002' }]
};

const subjects: Subject[] = [
  {
    createdAt: new Date(2026, 0, 1),
    groupIds: ['group-1'],
    id: 'Depression_Clinic$001',
    updatedAt: new Date(2026, 0, 1)
  }
];

const instruments = [{ id: 'instrument-1', title: 'Happiness Questionnaire' }];

const timepoints = [
  { expiresAt: '2026-11-01', instrumentId: 'instrument-1', instrumentTitle: 'Happiness Questionnaire' }
];

const assignments = [
  {
    expiresAt: new Date('2026-11-01T23:59:59.999Z'),
    id: 'assignment-1',
    instrumentId: 'instrument-1',
    subjectId: 'Depression_Clinic$0012345678',
    url: 'https://gateway.example.org/assignments/a'
  },
  {
    expiresAt: new Date('2026-11-01T23:59:59.999Z'),
    id: 'assignment-2',
    instrumentId: 'instrument-1',
    subjectId: 'Depression_Clinic$0029876543',
    url: 'https://gateway.example.org/assignments/b'
  }
];

const mockWizard = (step: WizardStep, overrides: Partial<Wizard> = {}): Wizard => {
  const wizard: Wizard = {
    acceptParsed: vi.fn(),
    assignments: [],
    clearCopied: vi.fn(),
    confirmTimepoints: vi.fn(),
    copyLinks: vi.fn(() => Promise.resolve()),
    describeSubject: vi.fn((subjectId: string) => subjectId),
    didCopy: false,
    emails: {},
    failure: null,
    goTo: vi.fn(),
    isPreflighting: false,
    isSubmitting: false,
    parsed: null,
    pastedText: '',
    resolveMapping: vi.fn(),
    resultRows: vi.fn(() => []),
    selectSubjects: vi.fn(),
    setEmails: vi.fn(),
    setPastedText: vi.fn(),
    setSelectedSubjectIds: vi.fn(),
    setSourceMode: vi.fn(),
    setTimepoints: vi.fn(),
    sourceMode: 'SELECT',
    startOver: vi.fn(),
    step,
    subjectIds: ['Depression_Clinic$001', 'Depression_Clinic$002'],
    submit: vi.fn(),
    timepoints,
    transportError: false,
    ...overrides
  };
  vi.mocked(useBulkAssignmentWizard).mockReturnValue(wizard);
  return wizard;
};

const onBack = vi.fn();

// A fresh element each time: React bails out of a re-render given the same element back, which
// would hide a change the mocked wizard hook has made.
const wizardElement = () => (
  <BulkRemoteAssignmentWizard
    defaultExpiresAt="2026-11-01"
    groupId="group-1"
    groupName="Depression Clinic"
    instruments={instruments}
    subjectIdDisplayLength={9}
    subjects={subjects}
    onBack={onBack}
  />
);

const renderWizard = () => render(wizardElement());

const propsOf = <TProps extends object>(component: React.FC<TProps>) => vi.mocked(component).mock.lastCall![0];

const mockMutateAsync = vi.fn();

/**
 * The three queries the wizard reads, each stubbed through one typed helper rather than cast at
 * every call site: a field renamed on any of them then fails here once, not silently everywhere.
 */
type GroupStub = Partial<Pick<Group, 'activeAssignmentEmailTemplateId' | 'emailTemplates'>>;

const mockSetupState = (state: Partial<SetupState>) =>
  vi.mocked(useSetupStateQuery).mockReturnValue({
    data: {
      activeLanguages: ['en', 'es', 'fr'],
      isDemo: false,
      isGatewayEnabled: false,
      isMailEnabled: false,
      isSetup: true,
      release: { buildTime: 0, type: 'production', version: '0.0.0' },
      uptime: 0,
      ...state
    }
  } as ReturnType<typeof useSetupStateQuery>);

const mockGroup = (group: GroupStub | undefined, { isLoading = false }: { isLoading?: boolean } = {}) =>
  vi.mocked(useGroupQuery).mockReturnValue({
    data: group && { activeAssignmentEmailTemplateId: null, emailTemplates: [], ...group },
    isLoading
  } as ReturnType<typeof useGroupQuery>);

const setupMocks = ({
  activeLanguages = ['en', 'es', 'fr'],
  isMailEnabled = false
}: { activeLanguages?: Language[]; isMailEnabled?: boolean } = {}) => {
  mockSetupState({ activeLanguages: activeLanguages as SetupState['activeLanguages'], isMailEnabled });
  mockGroup({});
  vi.mocked(useSendBulkAssignmentEmailMutation).mockReturnValue({
    mutateAsync: mockMutateAsync
  } as unknown as ReturnType<typeof useSendBulkAssignmentEmailMutation>);
};

describe('BulkRemoteAssignmentWizard', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    vi.clearAllMocks();
    useNotificationsStore.setState({ notifications: [] });
    setupMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should build the wizard for the group, its instruments and its identifier display length', () => {
    mockWizard('SOURCE');
    renderWizard();
    expect(useBulkAssignmentWizard).toHaveBeenCalledWith({
      groupId: 'group-1',
      instruments,
      subjectIdDisplayLength: 9
    });
  });

  describe('source step', () => {
    it('should render only the source step while choosing subjects', () => {
      mockWizard('SOURCE');
      renderWizard();
      expect(screen.getByTestId('source-step')).toBeTruthy();
      expect(screen.queryByTestId('map-step')).toBeNull();
      expect(screen.queryByTestId('timepoints-step')).toBeNull();
      expect(screen.queryByTestId('review-step')).toBeNull();
    });

    it('should hand the source step the tab the wizard holds, so Back from the mapping step returns to it', () => {
      const wizard = mockWizard('SOURCE', { sourceMode: 'PASTE' });
      renderWizard();
      const props = propsOf(SourceStep);
      expect(props.mode).toBe('PASTE');
      props.onModeChange('FILE');
      expect(wizard.setSourceMode).toHaveBeenCalledWith('FILE');
    });

    it('should hand the source step the selection the wizard holds, so stepping back does not discard it', () => {
      const wizard = mockWizard('SOURCE');
      renderWizard();
      expect(propsOf(SourceStep)).toMatchObject({
        groupName: 'Depression Clinic',
        isMailEnabled: false,
        onBack,
        onParsed: wizard.acceptParsed,
        onSelectedChange: wizard.setSelectedSubjectIds,
        onStepChange: wizard.goTo,
        onSubjectsSelected: wizard.selectSubjects,
        selectedIds: wizard.subjectIds,
        subjectIdDisplayLength: 9,
        subjects
      });
    });
  });

  describe('map step', () => {
    it('should render nothing for the map step until a file has been parsed', () => {
      mockWizard('MAP');
      renderWizard();
      expect(screen.queryByTestId('map-step')).toBeNull();
    });

    it('should hand the map step the parsed file and the group name it scopes identifiers with', () => {
      const wizard = mockWizard('MAP', { parsed });
      renderWizard();
      expect(propsOf(MapStep)).toMatchObject({
        groupName: 'Depression Clinic',
        knownSubjectIds: ['Depression_Clinic$001'],
        onStepChange: wizard.goTo,
        parsed
      });
    });

    it('should resolve the mapping against the parsed rows, so each id stays paired with its source row', () => {
      const wizard = mockWizard('MAP', { parsed });
      renderWizard();
      propsOf(MapStep).onResolved(['Depression_Clinic$001', 'Depression_Clinic$002'], parsed.rows);
      expect(wizard.resolveMapping).toHaveBeenCalledWith(
        ['Depression_Clinic$001', 'Depression_Clinic$002'],
        parsed.rows,
        parsed.mapping
      );
    });

    it('should return to the source step from the map step', () => {
      const wizard = mockWizard('MAP', { parsed });
      renderWizard();
      propsOf(MapStep).onBack();
      expect(wizard.goTo).toHaveBeenCalledWith('SOURCE');
    });
  });

  describe('timepoints step', () => {
    it('should hand the timepoints step the batch it is building and the preflight state', () => {
      const wizard = mockWizard('TIMEPOINTS', { isPreflighting: true });
      renderWizard();
      expect(propsOf(TimepointsStep)).toMatchObject({
        defaultExpiresAt: '2026-11-01',
        instruments,
        isLoading: true,
        onChange: wizard.setTimepoints,
        onConfirm: wizard.confirmTimepoints,
        onStepChange: wizard.goTo,
        subjectCount: 2,
        timepoints
      });
    });

    it('should return to the source step from the timepoints step', () => {
      const wizard = mockWizard('TIMEPOINTS');
      renderWizard();
      propsOf(TimepointsStep).onBack();
      expect(wizard.goTo).toHaveBeenCalledWith('SOURCE');
    });
  });

  describe('review step', () => {
    it('should hand the review step the refusal, submission state and submit handler', () => {
      const failure: BulkAssignmentFailure = {
        code: 'BULK_ASSIGNMENT_REFUSED',
        issues: [{ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['Depression_Clinic$001'] }]
      };
      const wizard = mockWizard('REVIEW', { failure, isSubmitting: true, transportError: true });
      renderWizard();
      expect(propsOf(ReviewStep)).toMatchObject({
        describeSubject: wizard.describeSubject,
        failure,
        isSubmitting: true,
        onStepChange: wizard.goTo,
        onSubmit: wizard.submit,
        subjectCount: 2,
        timepoints,
        transportError: true
      });
    });

    it('should return to the timepoints step from review', () => {
      const wizard = mockWizard('REVIEW');
      renderWizard();
      propsOf(ReviewStep).onBack();
      expect(wizard.goTo).toHaveBeenCalledWith('TIMEPOINTS');
    });
  });

  describe('done step', () => {
    it('should title the results with how many assignments were created', () => {
      mockWizard('DONE', { assignments });
      renderWizard();
      expect(screen.getByText('2 Assignments Created')).toBeTruthy();
    });

    it('should list each link beside its subject, unscoped and truncated as elsewhere in the app', () => {
      mockWizard('DONE', { assignments });
      renderWizard();
      const rows = [...screen.getByTestId('bulk-done-step').querySelectorAll('tbody tr')];
      expect(
        rows.map((row) => [...row.querySelectorAll('td')].slice(0, 2).map(({ textContent }) => textContent))
      ).toEqual([
        ['001234567', 'https://gateway.example.org/assignments/a'],
        ['002987654', 'https://gateway.example.org/assignments/b']
      ]);
    });

    // Stepping back keeps work on purpose, so creating more has to say explicitly that it wants an
    // empty wizard - otherwise the next batch opens holding the last one's subjects and timepoints.
    it('should start a new batch with nothing carried over when the user creates more', () => {
      const wizard = mockWizard('DONE', { assignments });
      renderWizard();
      fireEvent.click(screen.getByTestId('bulk-create-more'));
      expect(wizard.startOver).toHaveBeenCalledOnce();
      expect(wizard.goTo).not.toHaveBeenCalled();
    });

    it('should copy every link at once', () => {
      const wizard = mockWizard('DONE', { assignments });
      renderWizard();
      const copyButton = screen.getByTestId('bulk-copy-links');
      expect(copyButton.textContent).toBe('Copy All Links');
      fireEvent.click(copyButton);
      expect(wizard.copyLinks).toHaveBeenCalledOnce();
    });

    it('should confirm the copy, and reset the confirmation once the pointer leaves the button', () => {
      const wizard = mockWizard('DONE', { assignments, didCopy: true });
      renderWizard();
      const copyButton = screen.getByTestId('bulk-copy-links');
      expect(copyButton.textContent).toBe('Copied');
      fireEvent.mouseLeave(copyButton);
      expect(wizard.clearCopied).toHaveBeenCalledOnce();
    });

    it('should download the result rows as a timestamped CSV and release the object URL afterwards', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 4, 13, 5, 9));
      const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:results');
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
      const clicked: HTMLAnchorElement[] = [];
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        clicked.push(this);
      });
      mockWizard('DONE', {
        assignments,
        resultRows: vi.fn(() => [{ Link: 'https://gateway.example.org/assignments/a', Subject: '0012345678' }])
      });
      renderWizard();
      fireEvent.click(screen.getByTestId('bulk-download-csv'));
      expect(clicked).toHaveLength(1);
      expect(clicked[0]!.download).toBe('bulk-remote-assignments-2026-10-04T13-05-09.csv');
      expect(clicked[0]!.href).toBe('blob:results');
      const [blob] = createObjectURL.mock.lastCall!;
      assert(blob instanceof Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      expect(await blob.text()).toBe('Link,Subject\r\nhttps://gateway.example.org/assignments/a,0012345678');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:results');
    });
  });

  describe('email controls on done step', () => {
    const emailAssignments = assignments;
    // One subject assigned three instruments, which is what a battery looks like on the results step.
    const batteryAssignments = [
      assignments[0]!,
      { ...assignments[0]!, id: 'assignment-3', instrumentId: 'instrument-2', url: 'https://gateway.example.org/c' },
      { ...assignments[0]!, id: 'assignment-4', instrumentId: 'instrument-3', url: 'https://gateway.example.org/d' }
    ];
    const lastNotification = () => useNotificationsStore.getState().notifications.at(-1);
    // The send is driven through the dialog the button opens, since that is where the template and
    // language are chosen and where the confirmation lives.
    const openDialog = () => fireEvent.click(screen.getByTestId('bulk-email-all'));
    const sendAll = () => {
      openDialog();
      fireEvent.click(screen.getByTestId('bulk-email-confirm'));
    };

    const emails = {
      Depression_Clinic$0012345678: 'alice@example.com',
      Depression_Clinic$0029876543: 'bob@example.com'
    };

    it('should show email controls when mail is enabled and subjects have emails', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      expect(screen.getByTestId('bulk-email-table')).toBeTruthy();
      expect(screen.queryByTestId('bulk-done-step')).toBeNull();
    });

    it('should fall back to the plain link table when no subjects have emails', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails: {} });
      renderWizard();
      expect(screen.queryByTestId('bulk-email-table')).toBeNull();
      expect(screen.getByTestId('bulk-done-step')).toBeTruthy();
    });

    it('should show a language selector', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      openDialog();
      expect(screen.getByTestId('bulk-email-language')).toBeTruthy();
    });

    it('should show the email address and link for each assignment', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      const rows = [...screen.getByTestId('bulk-email-table').querySelectorAll('tbody tr')];
      expect(rows).toHaveLength(2);
      expect(rows[0]!.textContent).toContain('alice@example.com');
      expect(rows[1]!.textContent).toContain('bob@example.com');
    });

    it('should show a dash for subjects without an email', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', {
        assignments: emailAssignments,
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      const rows = [...screen.getByTestId('bulk-email-table').querySelectorAll('tbody tr')];
      expect(rows[1]!.querySelectorAll('td')[1]!.textContent).toBe('-');
    });

    it('should display the email all button with the count of emailable subjects', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      expect(screen.getByTestId('bulk-email-all').textContent).toBe('Email All (2)');
    });

    it('should send one email per subject with an address', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          assignmentIds: ['assignment-1'],
          language: 'en',
          recipient: 'alice@example.com',
          templateId: null
        })
      );
    });

    // The point of the bulk route: three instruments for one subject is one email, not three.
    it('should send a subject every one of their links in a single email', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: batteryAssignments, emails });
      renderWizard();
      expect(screen.getByTestId('bulk-email-all').textContent).toBe('Email All (1)');
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          assignmentIds: ['assignment-1', 'assignment-3', 'assignment-4'],
          recipient: 'alice@example.com'
        })
      );
    });

    it('should mark every row of a subject with the outcome of their one email', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'FAILED' });
      mockWizard('DONE', { assignments: batteryAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(lastNotification()).toBeTruthy());
      const rows = [...screen.getByTestId('bulk-email-table').querySelectorAll('tbody tr')];
      expect(rows).toHaveLength(3);
      expect(rows.every((row) => row.querySelector('svg.text-destructive'))).toBe(true);
    });

    it('should count emails rather than links when reporting the outcome', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: batteryAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(lastNotification()).toBeTruthy());
      expect(lastNotification()?.message).toBe('1 sent, 0 failed');
    });

    it('should retire the email all button once a send has run, so nobody is mailed a second link', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
      expect(screen.getByTestId<HTMLButtonElement>('bulk-email-all').disabled).toBe(true);
      fireEvent.click(screen.getByTestId('bulk-email-all'));
      expect(screen.queryByTestId('bulk-email-confirm')).toBeNull();
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should ask for the template and language in a dialog rather than beside the table', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      expect(screen.queryByTestId('bulk-email-language')).toBeNull();
      openDialog();
      expect(screen.getByTestId('bulk-email-language').closest('[role="dialog"]')).toBeTruthy();
    });

    it('should send nothing when the dialog is dismissed', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      openDialog();
      fireEvent.click(screen.getByTestId('bulk-email-cancel'));
      expect(screen.queryByTestId('bulk-email-confirm')).toBeNull();
      expect(mockMutateAsync).not.toHaveBeenCalled();
      expect(screen.getByTestId<HTMLButtonElement>('bulk-email-all').disabled).toBe(false);
    });

    it('should close the dialog once the send is confirmed, so the results are visible again', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
      expect(screen.queryByTestId('bulk-email-confirm')).toBeNull();
    });

    // Create More leads straight back here with a new batch, whose rows are new assignments: the
    // one-shot rule is about this batch, not about any send that ever happened in the session.
    it('should offer the send again for a batch created after one was already emailed', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      const { rerender } = renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
      expect(screen.getByTestId<HTMLButtonElement>('bulk-email-all').disabled).toBe(true);
      mockWizard('DONE', {
        assignments: emailAssignments.map((assignment, index) => ({ ...assignment, id: `later-${index}` })),
        emails
      });
      rerender(wizardElement());
      expect(screen.getByTestId<HTMLButtonElement>('bulk-email-all').disabled).toBe(false);
    });

    // A failure leaves that subject without their links, so the operator has to be able to try
    // again - and the retry must not write to anyone whose message already went out.
    it('should send only the failures when a send is run again after a partial failure', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValueOnce({ status: 'SENT' }).mockResolvedValueOnce({ status: 'FAILED' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
      const button = screen.getByTestId<HTMLButtonElement>('bulk-email-all');
      expect(button.disabled).toBe(false);
      expect(button.textContent).toBe('Retry Failed (1)');
      mockMutateAsync.mockClear();
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ recipient: 'bob@example.com' }));
      await waitFor(() => expect(screen.getByTestId<HTMLButtonElement>('bulk-email-all').disabled).toBe(true));
    });

    // A batch of one whose only message failed is still a retry: nobody has their links.
    it('should offer a retry when every message in the batch failed, not a fresh send', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'FAILED' });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      sendAll();
      await waitFor(() => expect(screen.getByTestId('bulk-email-all').textContent).toBe('Retry Failed (1)'));
    });

    it('should wait out a rate limit and send that recipient anyway, since the server sent nothing', async () => {
      setupMocks({ isMailEnabled: true });
      const throttled = Object.assign(new Error('Too Many Requests'), {
        isAxiosError: true,
        response: { headers: { 'retry-after': '0.001' }, status: 429 }
      });
      mockMutateAsync.mockRejectedValueOnce(throttled).mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      sendAll();
      await waitFor(() => expect(lastNotification()?.message).toBe('1 sent, 0 failed'));
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should wait a default interval when a rate limit does not say how long to wait for', async () => {
      setupMocks({ isMailEnabled: true });
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const throttled = Object.assign(new Error('Too Many Requests'), {
        isAxiosError: true,
        response: { headers: {}, status: 429 }
      });
      mockMutateAsync.mockRejectedValueOnce(throttled).mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
      await vi.advanceTimersByTimeAsync(5_000);
      await waitFor(() => expect(lastNotification()?.message).toBe('1 sent, 0 failed'));
      vi.useRealTimers();
    });

    it('should report a failure that is not a rate limit without retrying it, since the mail may have gone out', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockRejectedValue(new Error('network'));
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      sendAll();
      await waitFor(() => expect(lastNotification()?.message).toBe('0 sent, 1 failed'));
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should offer the email all button beside the other result actions, so every link action is in one row', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      const row = screen.getByTestId('bulk-copy-links').parentElement!;
      expect(row.contains(screen.getByTestId('bulk-email-all'))).toBe(true);
      expect(row.contains(screen.getByTestId('bulk-download-csv'))).toBe(true);
    });

    it('should confirm the send with the sent and failed counts', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(lastNotification()).toBeTruthy());
      expect(lastNotification()?.message).toBe('2 sent, 0 failed');
      expect(lastNotification()?.type).toBe('success');
    });

    it('should mark each assignment sent in the table', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
      const rows = [...screen.getByTestId('bulk-email-table').querySelectorAll('tbody tr')];
      expect(rows.every((row) => row.querySelector('svg.text-green-600'))).toBe(true);
    });

    it('should report failures in the summary', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValueOnce({ status: 'SENT' }).mockRejectedValueOnce(new Error('smtp error'));
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(lastNotification()).toBeTruthy());
      expect(lastNotification()?.message).toBe('1 sent, 1 failed');
      expect(lastNotification()?.type).toBe('error');
    });

    it('should handle a non-SENT status as a failure', async () => {
      setupMocks({ isMailEnabled: true });
      mockMutateAsync.mockResolvedValue({ status: 'FAILED' });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      sendAll();
      await waitFor(() => expect(lastNotification()).toBeTruthy());
      expect(lastNotification()?.message).toBe('0 sent, 2 failed');
    });

    it('should show a template selector when the group has templates', () => {
      setupMocks({ isMailEnabled: true });
      mockGroup({
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: [
          { body: { en: 'Hello {link}' }, id: 'tpl-1', name: 'Custom Template', subject: { en: 'Your assignment' } }
        ]
      });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      openDialog();
      expect(screen.getByTestId('bulk-email-template')).toBeTruthy();
    });

    it('should disable the email all button when all email addresses are blank', () => {
      setupMocks({ isMailEnabled: true });
      mockWizard('DONE', {
        assignments: emailAssignments,
        emails: {
          Depression_Clinic$0012345678: 'alice@example.com',
          Depression_Clinic$0029876543: '  '
        }
      });
      renderWizard();
      expect(screen.getByTestId('bulk-email-all').textContent).toBe('Email All (1)');
    });

    it('should still render when the group query is loading', () => {
      setupMocks({ isMailEnabled: true });
      mockGroup(undefined, { isLoading: true });
      mockWizard('DONE', { assignments: emailAssignments, emails });
      renderWizard();
      expect(screen.getByTestId('bulk-email-table')).toBeTruthy();
      expect(screen.getByTestId<HTMLButtonElement>('bulk-email-all').disabled).toBe(true);
    });

    it('should send with a custom template ID when one is selected', async () => {
      setupMocks({ isMailEnabled: true });
      mockGroup({
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: [
          {
            body: { en: 'Hi {link}', fr: 'Bonjour {link}' },
            id: 'tpl-1',
            name: 'Custom',
            subject: { en: 'Your assignment' }
          }
        ]
      });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ templateId: 'tpl-1' }));
    });

    it('should fall back to all languages when the selected template body has none authored', () => {
      setupMocks({ isMailEnabled: true });
      mockGroup({
        activeAssignmentEmailTemplateId: 'tpl-empty',
        emailTemplates: [{ body: {}, id: 'tpl-empty', name: 'Empty', subject: { en: 'Your assignment' } }]
      });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      openDialog();
      expect(screen.getByTestId('bulk-email-language')).toBeTruthy();
    });

    it('should fall back to the first authored language when the chosen language is not available', async () => {
      setupMocks({ isMailEnabled: true });
      mockGroup({
        activeAssignmentEmailTemplateId: 'tpl-fr',
        emailTemplates: [
          { body: { fr: 'Bonjour {link}' }, id: 'tpl-fr', name: 'French Only', subject: { en: 'Your assignment' } }
        ]
      });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ language: 'fr' }));
    });

    it('should offer the default template only in the languages the instance has enabled, so a disabled one cannot be sent', () => {
      setupMocks({ activeLanguages: ['en', 'fr'], isMailEnabled: true });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      openDialog();
      fireEvent.keyDown(screen.getByTestId('bulk-email-language'), { key: 'Enter' });
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['English', 'French']);
    });

    it('should send in a language the instance disabled when the template is authored in nothing else', async () => {
      setupMocks({ activeLanguages: ['en', 'fr'], isMailEnabled: true });
      mockGroup({
        activeAssignmentEmailTemplateId: 'tpl-es',
        emailTemplates: [
          { body: { es: 'Hola {link}' }, id: 'tpl-es', name: 'Spanish Only', subject: { en: 'Your assignment' } }
        ]
      });
      mockMutateAsync.mockResolvedValue({ status: 'SENT' });
      mockWizard('DONE', {
        assignments: [emailAssignments[0]!],
        emails: { Depression_Clinic$0012345678: 'alice@example.com' }
      });
      renderWizard();
      sendAll();
      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledOnce());
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ language: 'es' }));
    });
  });
});
