import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

test.describe('sessions', () => {
  // A session was previously given its groupId only when the subject was not already a member of
  // that group, so every visit after a subject's first was created without one. A group manager's
  // Session rule is `{ groupId: { in: [...] } }`, which made those sessions invisible to them and
  // uncounted by every group-scoped query, the dashboard trends included.
  //
  // Seeded into a group of its own, so the count is exactly what this test created.
  test('should keep a returning subject later sessions visible to their group manager', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });
    const accessToken = await ApiClient.login(apiRequestContext, credentials);
    const subjectId = `revisit-${uniqueId}`;

    await api.createSession(group.id, { id: subjectId });
    await api.createSession(group.id, { id: subjectId });

    const response = await apiRequestContext.get(`/api/v1/sessions?groupId=${group.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.status()).toBe(200);
    const sessions = (await response.json()) as { subjectId: string }[];
    expect(sessions.filter((session) => session.subjectId === subjectId)).toHaveLength(2);
  });
});
