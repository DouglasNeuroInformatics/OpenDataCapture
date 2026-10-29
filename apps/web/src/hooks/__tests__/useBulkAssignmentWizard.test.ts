import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createMutate: vi.fn(),
  preflightMutate: vi.fn(),
  writeText: vi.fn()
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: (selector: any) => selector({ addNotification: mocks.addNotification }),
  useTranslation: () => ({ t: (value: any) => (typeof value === 'string' ? value : value.en) })
}));

vi.mock('@/hooks/useBulkAssignments', () => ({
  toBulkAssignmentFailure: (error: unknown) => (error as { refusal?: unknown }).refusal ?? null,
  useBulkAssignmentPreflightMutation: () => ({ isPending: false, mutate: mocks.preflightMutate }),
  useCreateBulkAssignmentsMutation: () => ({ isPending: false, mutate: mocks.createMutate })
}));

const { useBulkAssignmentWizard } = await import('../useBulkAssignmentWizard');

const OPTIONS = {
  groupId: 'group-1',
  instruments: [{ id: 'instrument-1', title: 'Happiness Questionnaire' }],
  subjectIdDisplayLength: 9
};

const TIMEPOINT = {
  expiresAt: '2030-01-01',
  instrumentId: 'instrument-1',
  instrumentTitle: 'Happiness Questionnaire'
};

const PARSED = {
  headers: ['subjectId'],
  mapping: { subjectId: 'subjectId' },
  mode: 'ID',
  preview: [{ subjectId: 'alice' }],
  rows: [{ subjectId: 'alice' }, { subjectId: 'bob' }]
} as any;

const renderWizard = () => renderHook(() => useBulkAssignmentWizard(OPTIONS));

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: mocks.writeText }
  });
});

describe('useBulkAssignmentWizard', () => {
  it('should start on the source step with nothing collected', () => {
    const { result } = renderWizard();
    expect(result.current.step).toBe('SOURCE');
    expect(result.current.subjectIds).toEqual([]);
  });

  it('should send a parsed file to the mapping step, which is where its columns are confirmed', () => {
    const { result } = renderWizard();
    act(() => result.current.acceptParsed(PARSED));
    expect(result.current.step).toBe('MAP');
    expect(result.current.parsed).toEqual(PARSED);
  });

  it('should skip mapping for hand-picked subjects, which have no columns to confirm', () => {
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice', 'bob'], {}));
    expect(result.current.step).toBe('TIMEPOINTS');
    expect(result.current.subjectIds).toEqual(['alice', 'bob']);
    expect(result.current.parsed).toBeNull();
  });

  it('should keep subjects and timepoints when stepping backwards, so returning discards no work', () => {
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice'], {}));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.goTo('SOURCE'));
    expect(result.current.subjectIds).toEqual(['alice']);
    expect(result.current.timepoints).toEqual([TIMEPOINT]);
  });

  // The counterpart to the test above: stepping back keeps work, so starting over has to be the one
  // thing that does not, or the next batch opens holding the last one's.
  it('should carry nothing over when starting a new batch', () => {
    const created = [{ expiresAt: new Date(), instrumentId: 'instrument-1', subjectId: 'alice', url: 'http://link' }];
    mocks.createMutate.mockImplementation((_payload: unknown, { onSuccess }: any) => onSuccess(created));
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice'], { alice: 'alice@example.com' }));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.submit({ allowDuplicates: false, skipUnavailable: false }));
    act(() => result.current.startOver());
    expect(result.current.step).toBe('SOURCE');
    expect(result.current.subjectIds).toEqual([]);
    expect(result.current.timepoints).toEqual([]);
    expect(result.current.emails).toEqual({});
    expect(result.current.assignments).toEqual([]);
    expect(result.current.parsed).toBeNull();
  });

  it('should keep the source tab while stepping back, so Back from the mapping step returns to the upload or paste', () => {
    const { result } = renderWizard();
    expect(result.current.sourceMode).toBe('SELECT');
    act(() => result.current.setSourceMode('PASTE'));
    act(() => result.current.acceptParsed(PARSED));
    act(() => result.current.goTo('SOURCE'));
    expect(result.current.sourceMode).toBe('PASTE');
  });

  it('should keep the pasted text while stepping back, so Back returns to the data and not an empty box', () => {
    const { result } = renderWizard();
    expect(result.current.pastedText).toBe('');
    act(() => result.current.setPastedText('subjectId\nalice'));
    act(() => result.current.acceptParsed(PARSED));
    act(() => result.current.goTo('SOURCE'));
    expect(result.current.pastedText).toBe('subjectId\nalice');
  });

  it('should clear the pasted text when starting over', () => {
    const { result } = renderWizard();
    act(() => result.current.setPastedText('subjectId\nalice'));
    act(() => result.current.startOver());
    expect(result.current.pastedText).toBe('');
  });

  it('should return the source tab to the subject picker when starting over', () => {
    const { result } = renderWizard();
    act(() => result.current.setSourceMode('FILE'));
    act(() => result.current.startOver());
    expect(result.current.sourceMode).toBe('SELECT');
  });

  it('should forget the uploaded rows when starting over, so no identifier outlives its batch', () => {
    const { result } = renderWizard();
    act(() => result.current.acceptParsed(PARSED));
    act(() => result.current.resolveMapping(['alice-id'], PARSED.rows, PARSED.mapping));
    act(() => result.current.startOver());
    expect(result.current.describeSubject('alice-id')).toBe('alice-id');
  });

  it('should clear the copy confirmation when starting over', async () => {
    const { result } = renderWizard();
    await act(() => result.current.copyLinks());
    expect(result.current.didCopy).toBe(true);
    act(() => result.current.startOver());
    expect(result.current.didCopy).toBe(false);
  });

  it('should describe a subject by the row the user supplied, rather than by its identifier', () => {
    const { result } = renderWizard();
    act(() => result.current.acceptParsed(PARSED));
    act(() => result.current.resolveMapping(['alice-id', 'bob-id'], PARSED.rows, PARSED.mapping));
    expect(result.current.describeSubject('alice-id')).toBe('alice');
    // No row was supplied for this one, so it falls back to the truncated identifier.
    expect(result.current.describeSubject('carol-id')).toBe('carol-id');
  });

  it('should retain a refusal on the review step, so the user can see what to fix', () => {
    const refusal = { code: 'BULK_ASSIGNMENT_REFUSED', issues: [{ conflicts: [], kind: 'CONFLICT' }] };
    mocks.preflightMutate.mockImplementation((_payload: unknown, { onError }: any) => onError({ refusal }));
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice'], {}));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.confirmTimepoints());
    expect(result.current.step).toBe('REVIEW');
    expect(result.current.failure).toEqual(refusal);
  });

  it('should move to review with no refusal when preflight passes', () => {
    mocks.preflightMutate.mockImplementation((_payload: unknown, { onSuccess }: any) => onSuccess());
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice'], {}));
    act(() => result.current.confirmTimepoints());
    expect(result.current.step).toBe('REVIEW');
    expect(result.current.failure).toBeNull();
  });

  it('should still reach review when preflight fails without a refusal, rather than strand the user', () => {
    mocks.preflightMutate.mockImplementation((_payload: unknown, { onError }: any) => onError(new Error('offline')));
    const { result } = renderWizard();
    act(() => result.current.confirmTimepoints());
    expect(result.current.step).toBe('REVIEW');
    expect(result.current.failure).toBeNull();
  });

  it('should keep a refused submission on the review step, so the user can see what to fix', () => {
    const refusal = { code: 'BULK_ASSIGNMENT_REFUSED', issues: [{ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['a'] }] };
    mocks.createMutate.mockImplementation((_payload: unknown, { onError }: any) => onError({ refusal }));
    const { result } = renderWizard();
    act(() => result.current.goTo('REVIEW'));
    act(() => result.current.submit({ allowDuplicates: false, skipUnavailable: false }));
    expect(result.current.step).toBe('REVIEW');
    expect(result.current.failure).toEqual(refusal);
  });

  it('should fall back to the identifier for a subject whose supplied row is blank', () => {
    const { result } = renderWizard();
    act(() => result.current.resolveMapping(['alice-id', 'bob-id'], [{ subjectId: '' }], {}));
    expect(result.current.describeSubject('alice-id')).toBe('alice-id');
    expect(result.current.describeSubject('bob-id')).toBe('bob-id');
  });

  it('should truncate a fallback identifier to the configured display length', () => {
    const { result } = renderWizard();
    expect(result.current.describeSubject('a-very-long-subject-id')).toBe('a-very-lo');
  });

  it('should drop uploaded rows when subjects are then picked by hand, since they no longer line up', () => {
    const { result } = renderWizard();
    act(() => result.current.resolveMapping(['alice-id'], [{ subjectId: 'alice' }], {}));
    act(() => result.current.selectSubjects(['alice-id'], {}));
    expect(result.current.describeSubject('alice-id')).toBe('alice-id');
  });

  it('should name each result by its instrument title and the row the user supplied', () => {
    const created = [
      {
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
        instrumentId: 'instrument-1',
        subjectId: 'alice-id',
        url: 'http://link'
      }
    ];
    mocks.createMutate.mockImplementation((_payload: unknown, { onSuccess }: any) => onSuccess(created));
    const { result } = renderWizard();
    act(() => result.current.resolveMapping(['alice-id'], [{ subjectId: 'alice' }], PARSED.mapping));
    act(() => result.current.submit({ allowDuplicates: false, skipUnavailable: false }));
    expect(result.current.resultRows()).toEqual([
      expect.objectContaining({ instrument: 'Happiness Questionnaire', subjectId: 'alice', url: 'http://link' })
    ]);
  });

  it('should let a hand selection be edited in place without leaving the step', () => {
    const { result } = renderWizard();
    act(() => result.current.setSelectedSubjectIds(['alice']));
    expect(result.current.subjectIds).toEqual(['alice']);
    expect(result.current.step).toBe('SOURCE');
  });

  it('should report a transport failure rather than dressing it up as a refusal', () => {
    mocks.createMutate.mockImplementation((_payload: unknown, { onError }: any) => onError(new Error('offline')));
    const { result } = renderWizard();
    act(() => result.current.submit({ allowDuplicates: false, skipUnavailable: false }));
    expect(result.current.transportError).toBe(true);
    expect(result.current.failure).toBeNull();
    expect(result.current.step).not.toBe('DONE');
  });

  it('should expire each timepoint at the end of its chosen day, not at midnight before it', () => {
    mocks.createMutate.mockImplementation(() => undefined);
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice'], {}));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.submit({ allowDuplicates: true, skipUnavailable: false }));
    expect(mocks.createMutate.mock.lastCall?.[0]).toMatchObject({
      allowDuplicates: true,
      groupId: 'group-1',
      subjectIds: ['alice'],
      timepoints: [{ expiresAt: new Date('2030-01-01T23:59:59.999Z'), instrumentId: 'instrument-1' }]
    });
  });

  it('should land on the results step with what was created', () => {
    const created = [{ expiresAt: new Date(), instrumentId: 'instrument-1', subjectId: 'alice', url: 'http://link' }];
    mocks.createMutate.mockImplementation((_payload: unknown, { onSuccess }: any) => onSuccess(created));
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice'], {}));
    act(() => result.current.submit({ allowDuplicates: false, skipUnavailable: false }));
    expect(result.current.step).toBe('DONE');
    expect(result.current.assignments).toEqual(created);
  });

  it('should exclude assignments for subjects that were filtered out by skipUnavailable', () => {
    const refusal = {
      code: 'BULK_ASSIGNMENT_REFUSED',
      issues: [{ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['bob'] }]
    };
    const created = [
      { expiresAt: new Date(), instrumentId: 'instrument-1', subjectId: 'alice', url: 'http://link-a' },
      { expiresAt: new Date(), instrumentId: 'instrument-1', subjectId: 'bob', url: 'http://link-b' }
    ];
    mocks.preflightMutate.mockImplementation((_payload: unknown, { onError }: any) => onError({ refusal }));
    mocks.createMutate.mockImplementation((_payload: unknown, { onSuccess }: any) => onSuccess(created));
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice', 'bob'], { alice: 'a@x.com', bob: 'b@x.com' }));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.confirmTimepoints());
    act(() => result.current.submit({ allowDuplicates: false, skipUnavailable: true }));
    expect(result.current.assignments).toEqual([created[0]]);
    expect(result.current.emails).toEqual({ alice: 'a@x.com' });
  });

  it('should tell the user to use the CSV when the browser offers no clipboard', async () => {
    Object.defineProperty(globalThis.navigator, 'clipboard', { configurable: true, value: undefined });
    const { result } = renderWizard();
    await act(() => result.current.copyLinks());
    expect(mocks.addNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    expect(result.current.didCopy).toBe(false);
  });

  it('should copy the links and report that it did', async () => {
    mocks.writeText.mockResolvedValue(undefined);
    const { result } = renderWizard();
    await act(() => result.current.copyLinks());
    expect(mocks.writeText).toHaveBeenCalled();
    expect(result.current.didCopy).toBe(true);
  });

  it('should clear the copied confirmation, so a later copy can be acknowledged again', async () => {
    mocks.writeText.mockResolvedValue(undefined);
    const { result } = renderWizard();
    await act(() => result.current.copyLinks());
    act(() => result.current.clearCopied());
    expect(result.current.didCopy).toBe(false);
  });

  it('should extract emails from the parsed rows when a column is mapped to email', () => {
    const emailParsed = {
      headers: ['subjectId', 'email'],
      mapping: { email: 'email', subjectId: 'subjectId' },
      mode: 'ID',
      preview: [{ email: 'alice@example.com', subjectId: 'alice' }],
      rows: [
        { email: 'alice@example.com', subjectId: 'alice' },
        { email: 'bob@example.com', subjectId: 'bob' }
      ]
    } as any;
    const { result } = renderWizard();
    act(() => result.current.resolveMapping(['alice-id', 'bob-id'], emailParsed.rows, emailParsed.mapping));
    expect(result.current.emails).toEqual({ 'alice-id': 'alice@example.com', 'bob-id': 'bob@example.com' });
  });

  it('should skip rows with empty or missing email values when extracting', () => {
    const emailParsed = {
      headers: ['subjectId', 'email'],
      mapping: { email: 'email', subjectId: 'subjectId' },
      mode: 'ID',
      preview: [{ email: '', subjectId: 'alice' }],
      rows: [
        { email: '', subjectId: 'alice' },
        { email: 'bob@example.com', subjectId: 'bob' }
      ]
    } as any;
    const { result } = renderWizard();
    act(() => result.current.resolveMapping(['alice-id', 'bob-id'], emailParsed.rows, emailParsed.mapping));
    expect(result.current.emails).toEqual({ 'bob-id': 'bob@example.com' });
  });

  it('should clear emails when no column is mapped to email', () => {
    const { result } = renderWizard();
    act(() => result.current.setEmails({ 'alice-id': 'old@example.com' }));
    act(() => result.current.resolveMapping(['alice-id'], PARSED.rows, PARSED.mapping));
    expect(result.current.emails).toEqual({});
  });

  it('should filter out unavailable subjects when skipUnavailable is true', () => {
    const refusal = {
      code: 'BULK_ASSIGNMENT_REFUSED',
      issues: [{ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['bob'] }]
    };
    mocks.preflightMutate.mockImplementation((_payload: unknown, { onError }: any) => onError({ refusal }));
    mocks.createMutate.mockImplementation(() => undefined);
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice', 'bob'], {}));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.confirmTimepoints());
    act(() => result.current.submit({ allowDuplicates: false, skipUnavailable: true }));
    expect(mocks.createMutate.mock.lastCall?.[0]).toMatchObject({ subjectIds: ['alice'] });
  });

  it('should store emails passed from the subject picker', () => {
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice'], { alice: 'alice@example.com' }));
    expect(result.current.emails).toEqual({ alice: 'alice@example.com' });
  });
});
