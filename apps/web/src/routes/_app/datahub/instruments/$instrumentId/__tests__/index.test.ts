import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import { Route } from '@/routes/_app/datahub/instruments/$instrumentId/index';

const runBeforeLoad = (args: { params: { instrumentId: string }; search: { palette: string } }) => {
  const beforeLoad = Route.options.beforeLoad as (opts: typeof args) => void;
  try {
    beforeLoad(args);
  } catch (err) {
    return err;
  }
  return null;
};

describe('Route', () => {
  // The record table is the landing tab, so an instrument link with no tab still opens a page.
  it('should redirect to the record table, carrying the instrument and its filters', () => {
    const thrown = runBeforeLoad({ params: { instrumentId: 'hq-1' }, search: { palette: 'jade' } });
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({
      options: {
        params: { instrumentId: 'hq-1' },
        search: { palette: 'jade' },
        to: '/datahub/instruments/$instrumentId/table'
      }
    });
  });
});
