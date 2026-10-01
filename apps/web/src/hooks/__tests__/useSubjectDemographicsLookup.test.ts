import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subjectDemographicsQueryOptions } from '../useSubjectDemographicsLookup';

vi.mock('axios');

const runQuery = (id: string) => new QueryClient().fetchQuery(subjectDemographicsQueryOptions({ params: { id } }));

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

describe('subjectDemographicsQueryOptions', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('should return only the date of birth and sex, so no other subject data reaches the form', async () => {
    get.mockResolvedValueOnce({
      data: { dateOfBirth: '1990-01-01', firstName: 'Jane', id: 'root$a', sex: 'FEMALE' },
      status: 200
    });
    await expect(runQuery('root$a')).resolves.toStrictEqual({ dateOfBirth: new Date('1990-01-01'), sex: 'FEMALE' });
  });

  it('should resolve to null for an id no subject has, so a new identifier leaves the fields editable', async () => {
    get.mockResolvedValueOnce({ data: { message: 'Not Found' }, status: 404 });
    await expect(runQuery('root$new')).resolves.toBeNull();
  });

  it('should accept a 404 as a valid status, so a new identifier raises no error notification', async () => {
    get.mockResolvedValueOnce({ data: null, status: 404 });
    await runQuery('root$new');
    const { validateStatus } = get.mock.lastCall?.[1] as { validateStatus: (status: number) => boolean };
    expect([validateStatus(200), validateStatus(404), validateStatus(500)]).toStrictEqual([true, true, false]);
  });

  it('should encode the scope separator in the path, so the id reaches the API intact', async () => {
    get.mockResolvedValueOnce({ data: { dateOfBirth: null, sex: null }, status: 200 });
    await runQuery('root$a b');
    expect(get.mock.lastCall?.[0]).toBe('/v1/subjects/root%24a%20b');
  });
});
