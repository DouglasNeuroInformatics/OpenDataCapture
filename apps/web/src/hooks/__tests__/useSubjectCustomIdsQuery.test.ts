import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subjectCustomIdsQueryOptions } from '../useSubjectCustomIdsQuery';

vi.mock('axios');

const runQuery = (groupId?: string) =>
  new QueryClient().fetchQuery(subjectCustomIdsQueryOptions({ params: { groupId } }));

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

describe('subjectCustomIdsQueryOptions', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("should request only the group's custom ids rather than every subject in it", async () => {
    get.mockResolvedValueOnce({ data: ['group$a', 'group$b'] });
    await expect(runQuery('group-1')).resolves.toStrictEqual(['group$a', 'group$b']);
    expect(get).toHaveBeenCalledWith('/v1/subjects/groups/group-1/custom-ids');
  });

  it('should request the default group custom ids without a group, so an admin with no group is offered the subjects its sessions create', async () => {
    get.mockResolvedValueOnce({ data: ['root$a'] });
    await expect(runQuery()).resolves.toStrictEqual(['root$a']);
    expect(get).toHaveBeenCalledWith('/v1/subjects/default-group/custom-ids');
  });

  it('should reject a response that is not a list of ids, so nothing unparsed reaches the form', async () => {
    get.mockResolvedValueOnce({ data: [{ firstName: 'Jane', id: 'group$a' }] });
    await expect(runQuery('group-1')).rejects.toThrow();
  });

  it('should key the cache on the group, so switching group does not serve the previous group ids', () => {
    expect(subjectCustomIdsQueryOptions({ params: { groupId: 'group-1' } }).queryKey).not.toStrictEqual(
      subjectCustomIdsQueryOptions({ params: { groupId: 'group-2' } }).queryKey
    );
  });
});
