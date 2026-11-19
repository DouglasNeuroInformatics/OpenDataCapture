import type { Assignment, BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import type { APIRequestContext } from '@playwright/test';

import { expect, test } from '../support/fixtures';

import type { ApiClient } from '../support/api-client';

/**
 * Bulk remote assignments, driven through the API rather than the UI.
 *
 * This is the tier that exercises the parts unit tests cannot: real Mongo scoping, the real gateway
 * round trip, and the all-or-nothing guarantee across both. The request schemas' refusals (past
 * expiry, subject limit, plain-http redirect) are `packages/schemas` unit tests and
 * `apps/api/test/suites/05-assignment-redirect.suite.ts`; the wizard has its own coverage.
 */

const API = '/api/v1';

const futureIso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

/**
 * A group with its own subjects. `api.createGroup` grants the group every instrument, and each
 * subject is linked to the group by creating a session for it — the same path the app uses.
 */
const seedGroup = async (api: ApiClient, uniqueId: string, subjectCount: number) => {
  const group = await api.createGroup({ name: `Bulk${uniqueId}` });
  const subjectIds: string[] = [];
  for (let index = 0; index < subjectCount; index++) {
    const session = await api.createSession(group.id, { id: `bulk_${uniqueId}_${index}` });
    subjectIds.push(session.subjectId);
  }
  return { group, subjectIds };
};

const instrumentIdsFor = async (apiRequestContext: APIRequestContext, adminToken: string, count: number) => {
  const response = await apiRequestContext.get(`${API}/instruments/info`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const info = (await response.json()) as { id: string; kind: string }[];
  return info
    .filter(({ kind }) => kind === 'FORM' || kind === 'INTERACTIVE')
    .slice(0, count)
    .map(({ id }) => id);
};

const post = (apiRequestContext: APIRequestContext, adminToken: string, path: string, data: unknown) => {
  return apiRequestContext.post(`${API}${path}`, { data, headers: { Authorization: `Bearer ${adminToken}` } });
};

test.describe('bulk remote assignments', () => {
  test('should create one assignment per subject per timepoint, each sending its subject on, and refuse a repeat as a conflict', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const { group, subjectIds } = await seedGroup(api, uniqueId, 2);
    const [instrumentA, instrumentB] = await instrumentIdsFor(apiRequestContext, adminToken, 2);
    const redirectUrl = `https://example.com/done/${uniqueId}`;
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

    const created = await post(apiRequestContext, adminToken, '/assignments/bulk', { ...request, redirectUrl });
    expect(created.status(), await created.text()).toBe(201);
    const assignments = (await created.json()) as Assignment[];
    expect(assignments.map((assignment) => assignment.redirectUrl)).toEqual(Array(4).fill(redirectUrl));

    // The private key that decrypts an assignment must never reach a client.
    expect(JSON.stringify(assignments)).not.toContain('encryptionKeyPair');

    // Every assignment really exists, and is scoped to this group.
    for (const subjectId of subjectIds) {
      const existing = await api.findAssignments(subjectId);
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
    const { group, subjectIds } = await seedGroup(api, uniqueId, 1);
    const other = await seedGroup(api, `${uniqueId}x`, 1);
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
    expect(await api.findAssignments(subjectIds[0]!)).toHaveLength(0);
  });
});
