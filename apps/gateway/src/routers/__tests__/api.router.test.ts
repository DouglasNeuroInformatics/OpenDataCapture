import { $CreateRemoteAssignmentsData } from '@opendatacapture/schemas/assignment';
import { describe, expect, it } from 'vitest';

const instrumentContainer = {
  bundle: 'export default {}',
  id: 'instrument-1',
  kind: 'FORM'
};

const assignment = {
  completedAt: null,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  groupId: 'group-1',
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  publicKey: [1, 2, 3],
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  url: 'http://localhost:3500/assignments/assignment-1'
};

describe('$CreateRemoteAssignmentsData', () => {
  it('should accept a batch carrying one container for many assignments, so a bundle is not repeated per row', () => {
    const result = $CreateRemoteAssignmentsData.safeParse({
      assignments: [
        assignment,
        { ...assignment, id: 'assignment-2', subjectId: 'subject-2' },
        { ...assignment, id: 'assignment-3', subjectId: 'subject-3' }
      ],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(result.success).toBe(true);
    expect(result.data?.instruments).toHaveLength(1);
    expect(result.data?.assignments).toHaveLength(3);
  });

  it('should reject a batch with no assignments, so an empty request is not a silent no-op', () => {
    const result = $CreateRemoteAssignmentsData.safeParse({
      assignments: [],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(result.success).toBe(false);
  });

  it('should reject a batch with no instruments, since every assignment resolves its bundle by id', () => {
    const result = $CreateRemoteAssignmentsData.safeParse({ assignments: [assignment], instruments: [] });
    expect(result.success).toBe(false);
  });

  it('should reject an assignment that names no instrument, which could not be paired to a container', () => {
    const { instrumentId: _instrumentId, ...withoutInstrument } = assignment;
    const result = $CreateRemoteAssignmentsData.safeParse({
      assignments: [withoutInstrument],
      instruments: [{ instrumentContainer, instrumentId: 'instrument-1' }]
    });
    expect(result.success).toBe(false);
  });
});
