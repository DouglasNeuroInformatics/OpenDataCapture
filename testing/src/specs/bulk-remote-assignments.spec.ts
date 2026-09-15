import { BULK_ASSIGNMENT_MAX_SUBJECTS } from '@opendatacapture/schemas/assignment';
import type { Assignment, BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';

import { expect, test } from '../support/fixtures';

/**
 * Bulk remote assignments, driven through the API rather than the UI.
 *
 * This is the tier that exercises the parts unit tests cannot: real Mongo scoping, the real gateway
 * round trip, and the all-or-nothing guarantee across both. The wizard has its own coverage.
 */

const API = '/api/v1';

const futureIso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

test.describe('bulk remote assignments', () => {
  /**
   * A group with its own subjects. `api.createGroup` grants the group every instrument, and each
   * subject is linked to the group by creating a session for it — the same path the app uses.
   */
  const seedGroup = async (
    { adminToken, api, apiRequestContext }: { adminToken: string; api: any; apiRequestContext: any },
    uniqueId: string,
    subjectCount: number
  ) => {
    const group = await api.createGroup({ name: `Bulk${uniqueId}` });
    const subjectIds: string[] = [];
    for (let index = 0; index < subjectCount; index++) {
      const id = `bulk_${uniqueId}_${index}`;
      const response = await apiRequestContext.post(`${API}/sessions`, {
        data: {
          date: new Date().toISOString(),
          groupId: group.id,
          subjectData: { id },
          type: 'IN_PERSON'
        },
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(response.status(), await response.text()).toBe(201);
      subjectIds.push(id);
    }
    return { group, subjectIds };
  };

  const instrumentIdsFor = async (apiRequestContext: any, adminToken: string, count: number) => {
    const response = await apiRequestContext.get(`${API}/instruments/info`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const info = (await response.json()) as { id: string; kind: string }[];
    return info
      .filter(({ kind }) => kind === 'FORM' || kind === 'INTERACTIVE')
      .slice(0, count)
      .map(({ id }) => id);
  };

  const post = (apiRequestContext: any, adminToken: string, path: string, data: unknown) =>
    apiRequestContext.post(`${API}${path}`, { data, headers: { Authorization: `Bearer ${adminToken}` } });

  test('should create one assignment per subject per timepoint, and refuse a repeat as a conflict', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const { group, subjectIds } = await seedGroup({ adminToken, api, apiRequestContext }, uniqueId, 2);
    const [instrumentA, instrumentB] = await instrumentIdsFor(apiRequestContext, adminToken, 2);
    const request = {
      groupId: group.id,
      subjectIds,
      timepoints: [
        { expiresAt: futureIso(30), instrumentId: instrumentA },
        { expiresAt: futureIso(60), instrumentId: instrumentB }
      ]
    };

    const preflight = await post(apiRequestContext, adminToken, '/assignments/bulk/preflight', request);
    expect(preflight.status()).toBe(200);
    expect(await preflight.json()).toMatchObject({ assignmentCount: 4, subjectCount: 2, timepointCount: 2 });

    const created = await post(apiRequestContext, adminToken, '/assignments/bulk', request);
    expect(created.status()).toBe(201);
    const assignments = (await created.json()) as Assignment[];
    expect(assignments).toHaveLength(4);

    // The private key that decrypts an assignment must never reach a client.
    expect(JSON.stringify(assignments)).not.toContain('encryptionKeyPair');

    // Every assignment really exists, and is scoped to this group.
    for (const subjectId of subjectIds) {
      const response = await apiRequestContext.get(`${API}/assignments?subjectId=${subjectId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const existing = (await response.json()) as Assignment[];
      expect(existing.filter((assignment) => assignment.groupId === group.id)).toHaveLength(2);
    }

    // Re-running the same batch is now a conflict for every pair, and creates nothing.
    const repeat = await post(apiRequestContext, adminToken, '/assignments/bulk/preflight', request);
    expect(repeat.status()).toBe(422);
    const failure = (await repeat.json()) as BulkAssignmentFailure;
    const conflict = failure.issues.find((issue) => issue.kind === 'CONFLICT');
    expect(conflict?.kind === 'CONFLICT' && conflict.conflicts).toHaveLength(4);

    // The caller may accept the duplicates, but only by saying so.
    const waived = await post(apiRequestContext, adminToken, '/assignments/bulk/preflight', {
      ...request,
      allowDuplicates: true
    });
    expect(waived.status()).toBe(200);
  });

  test('should report a subject from another group as unavailable, without creating anything', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const { group, subjectIds } = await seedGroup({ adminToken, api, apiRequestContext }, uniqueId, 1);
    const other = await seedGroup({ adminToken, api, apiRequestContext }, `${uniqueId}x`, 1);
    const [instrumentId] = await instrumentIdsFor(apiRequestContext, adminToken, 1);

    const response = await post(apiRequestContext, adminToken, '/assignments/bulk', {
      groupId: group.id,
      subjectIds: [...subjectIds, ...other.subjectIds],
      timepoints: [{ expiresAt: futureIso(30), instrumentId }]
    });
    expect(response.status()).toBe(422);
    const failure = (await response.json()) as BulkAssignmentFailure;
    const issue = failure.issues.find(({ kind }) => kind === 'SUBJECT_UNAVAILABLE');
    expect(issue?.kind === 'SUBJECT_UNAVAILABLE' && issue.subjectIds).toEqual(other.subjectIds);

    // All-or-nothing: the subject that *was* eligible must not have been assigned either.
    const assignments = await apiRequestContext.get(`${API}/assignments?subjectId=${subjectIds[0]}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect((await assignments.json()) as Assignment[]).toHaveLength(0);
  });

  test('should refuse an instrument the group has not been granted', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const { group, subjectIds } = await seedGroup({ adminToken, api, apiRequestContext }, uniqueId, 1);
    const response = await post(apiRequestContext, adminToken, '/assignments/bulk/preflight', {
      groupId: group.id,
      subjectIds,
      timepoints: [{ expiresAt: futureIso(30), instrumentId: 'not-an-instrument' }]
    });
    expect(response.status()).toBe(422);
    const failure = (await response.json()) as BulkAssignmentFailure;
    expect(failure.issues.some(({ kind }) => kind === 'INSTRUMENT_UNAVAILABLE')).toBe(true);
  });

  test('should reject an expiry in the past and a batch beyond the subject limit', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const { group, subjectIds } = await seedGroup({ adminToken, api, apiRequestContext }, uniqueId, 1);
    const [instrumentId] = await instrumentIdsFor(apiRequestContext, adminToken, 1);

    const expired = await post(apiRequestContext, adminToken, '/assignments/bulk', {
      groupId: group.id,
      subjectIds,
      timepoints: [{ expiresAt: new Date(Date.now() - 86_400_000).toISOString(), instrumentId }]
    });
    expect(expired.status()).toBe(400);

    const tooMany = await post(apiRequestContext, adminToken, '/assignments/bulk/preflight', {
      groupId: group.id,
      subjectIds: Array.from({ length: BULK_ASSIGNMENT_MAX_SUBJECTS + 1 }, (_, index) => `s-${index}`),
      timepoints: [{ expiresAt: futureIso(30), instrumentId }]
    });
    expect(tooMany.status()).toBe(400);
  });
});
