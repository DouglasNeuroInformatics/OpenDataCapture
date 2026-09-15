import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  $BulkAssignmentFailure,
  $BulkAssignmentIssue,
  $BulkAssignmentPreflightData,
  $CreateAssignmentData,
  $CreateBulkAssignmentsData,
  BULK_ASSIGNMENT_MAX_SUBJECTS
} from './assignment.js';

const futureDate = () => new Date(Date.now() + 86_400_000);

const baseRequest = {
  groupId: 'group-1',
  subjectIds: ['subject-1', 'subject-2'],
  timepoints: [{ expiresAt: futureDate(), instrumentId: 'instrument-1' }]
};

const subjectIds = (count: number) => Array.from({ length: count }, (_, index) => `subject-${index}`);

afterEach(() => {
  vi.useRealTimers();
});

describe('$CreateAssignmentData', () => {
  it('should reject an expiry in the past', () => {
    expect(
      $CreateAssignmentData.safeParse({
        expiresAt: new Date(Date.now() - 1000),
        instrumentId: 'instrument-1',
        subjectId: 'subject-1'
      }).success
    ).toBe(false);
  });

  it('should compare expiry against the current time rather than when the module was loaded, so a long-running process does not keep accepting a boundary that has since passed', () => {
    const expiresAt = futureDate();
    expect($CreateAssignmentData.safeParse({ expiresAt, instrumentId: 'i', subjectId: 's' }).success).toBe(true);

    // Advance well past that expiry: a schema that captured `new Date()` at import time would still
    // accept it, because its lower bound never moves.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(expiresAt.getTime() + 86_400_000));
    expect($CreateAssignmentData.safeParse({ expiresAt, instrumentId: 'i', subjectId: 's' }).success).toBe(false);
  });
});

describe('$BulkAssignmentPreflightData', () => {
  it('should accept a well-formed request and default allowDuplicates to false, so a conflict is never waived implicitly', () => {
    const result = $BulkAssignmentPreflightData.safeParse(baseRequest);
    expect(result.success).toBe(true);
    expect(result.data?.allowDuplicates).toBe(false);
  });

  it(`should accept exactly ${BULK_ASSIGNMENT_MAX_SUBJECTS} subjects`, () => {
    const result = $BulkAssignmentPreflightData.safeParse({
      ...baseRequest,
      subjectIds: subjectIds(BULK_ASSIGNMENT_MAX_SUBJECTS)
    });
    expect(result.success).toBe(true);
  });

  it(`should reject ${BULK_ASSIGNMENT_MAX_SUBJECTS + 1} subjects`, () => {
    const result = $BulkAssignmentPreflightData.safeParse({
      ...baseRequest,
      subjectIds: subjectIds(BULK_ASSIGNMENT_MAX_SUBJECTS + 1)
    });
    expect(result.success).toBe(false);
  });

  it('should reject duplicate subject ids, which would assign the same person twice in one batch', () => {
    const result = $BulkAssignmentPreflightData.safeParse({
      ...baseRequest,
      subjectIds: ['subject-1', 'subject-1']
    });
    expect(result.success).toBe(false);
  });

  it('should reject the same instrument at two timepoints, which would give one subject two live links to it', () => {
    const result = $BulkAssignmentPreflightData.safeParse({
      ...baseRequest,
      timepoints: [
        { expiresAt: futureDate(), instrumentId: 'instrument-1' },
        { expiresAt: futureDate(), instrumentId: 'instrument-1' }
      ]
    });
    expect(result.success).toBe(false);
  });

  it('should reject an empty subject list', () => {
    expect($BulkAssignmentPreflightData.safeParse({ ...baseRequest, subjectIds: [] }).success).toBe(false);
  });

  it('should reject an empty timepoint list', () => {
    expect($BulkAssignmentPreflightData.safeParse({ ...baseRequest, timepoints: [] }).success).toBe(false);
  });
});

describe('$CreateBulkAssignmentsData', () => {
  it('should reject a timepoint whose expiry is in the past', () => {
    const result = $CreateBulkAssignmentsData.safeParse({
      ...baseRequest,
      timepoints: [{ expiresAt: new Date(Date.now() - 1000), instrumentId: 'instrument-1' }]
    });
    expect(result.success).toBe(false);
  });
});

describe('$BulkAssignmentIssue', () => {
  it('should parse every variant, so a client can exhaustively narrow on kind', () => {
    const variants = [
      { conflicts: [{ instrumentId: 'instrument-1', subjectId: 'subject-1' }], kind: 'CONFLICT' },
      { instrumentIds: ['instrument-1'], kind: 'INSTRUMENT_UNAVAILABLE' },
      { kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['subject-1'] }
    ];
    for (const variant of variants) {
      expect($BulkAssignmentIssue.safeParse(variant).success).toBe(true);
    }
  });

  it('should reject an unknown kind', () => {
    expect($BulkAssignmentIssue.safeParse({ kind: 'SOMETHING_ELSE' }).success).toBe(false);
  });

  it('should reject an issue variant carrying no detail, which would tell the user nothing', () => {
    expect($BulkAssignmentIssue.safeParse({ conflicts: [], kind: 'CONFLICT' }).success).toBe(false);
    expect($BulkAssignmentIssue.safeParse({ kind: 'SUBJECT_UNAVAILABLE', subjectIds: [] }).success).toBe(false);
  });
});

describe('$BulkAssignmentFailure', () => {
  it('should parse a refusal carrying its issues', () => {
    const result = $BulkAssignmentFailure.safeParse({
      code: 'BULK_ASSIGNMENT_REFUSED',
      issues: [{ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['subject-1'] }]
    });
    expect(result.success).toBe(true);
  });

  it('should reject a refusal with no issues, since the user could not be told what to fix', () => {
    expect($BulkAssignmentFailure.safeParse({ code: 'BULK_ASSIGNMENT_REFUSED', issues: [] }).success).toBe(false);
  });
});
