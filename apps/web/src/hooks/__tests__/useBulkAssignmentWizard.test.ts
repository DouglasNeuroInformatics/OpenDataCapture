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
    act(() => result.current.selectSubjects(['alice', 'bob']));
    expect(result.current.step).toBe('TIMEPOINTS');
    expect(result.current.subjectIds).toEqual(['alice', 'bob']);
    expect(result.current.parsed).toBeNull();
  });

  it('should keep subjects and timepoints when stepping backwards, so returning discards no work', () => {
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice']));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.goTo('SOURCE'));
    expect(result.current.subjectIds).toEqual(['alice']);
    expect(result.current.timepoints).toEqual([TIMEPOINT]);
  });

  it('should describe a subject by the row the user supplied, rather than by its identifier', () => {
    const { result } = renderWizard();
    act(() => result.current.acceptParsed(PARSED));
    act(() => result.current.resolveMapping(['alice-id', 'bob-id'], PARSED.rows));
    expect(result.current.describeSubject('alice-id')).toBe('alice');
    // No row was supplied for this one, so it falls back to the truncated identifier.
    expect(result.current.describeSubject('carol-id')).toBe('carol-id');
  });

  it('should retain a refusal on the review step, so the user can see what to fix', () => {
    const refusal = { code: 'BULK_ASSIGNMENT_REFUSED', issues: [{ conflicts: [], kind: 'CONFLICT' }] };
    mocks.preflightMutate.mockImplementation((_payload: unknown, { onError }: any) => onError({ refusal }));
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice']));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.confirmTimepoints());
    expect(result.current.step).toBe('REVIEW');
    expect(result.current.failure).toEqual(refusal);
  });

  it('should report a transport failure rather than dressing it up as a refusal', () => {
    mocks.createMutate.mockImplementation((_payload: unknown, { onError }: any) => onError(new Error('offline')));
    const { result } = renderWizard();
    act(() => result.current.submit({ allowDuplicates: false }));
    expect(result.current.transportError).toBe(true);
    expect(result.current.failure).toBeNull();
    expect(result.current.step).not.toBe('DONE');
  });

  it('should expire each timepoint at the end of its chosen day, not at midnight before it', () => {
    mocks.createMutate.mockImplementation(() => undefined);
    const { result } = renderWizard();
    act(() => result.current.selectSubjects(['alice']));
    act(() => result.current.setTimepoints([TIMEPOINT]));
    act(() => result.current.submit({ allowDuplicates: true }));
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
    act(() => result.current.submit({ allowDuplicates: false }));
    expect(result.current.step).toBe('DONE');
    expect(result.current.assignments).toEqual(created);
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
});
