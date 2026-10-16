import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import { Route } from '@/routes/_app/datahub/index';

const runBeforeLoad = () => {
  const beforeLoad = Route.options.beforeLoad as () => void;
  try {
    beforeLoad();
  } catch (err) {
    return err;
  }
  return null;
};

describe('_app datahub index route', () => {
  it('should redirect to the subject hub, so a bookmarked /datahub link still lands on a page', () => {
    const thrown = runBeforeLoad();
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/datahub/subjects' } });
  });
});
