import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import { Route } from '@/routes/_app/index';

const runBeforeLoad = () => {
  const beforeLoad = Route.options.beforeLoad as () => void;
  try {
    beforeLoad();
  } catch (err) {
    return err;
  }
  return null;
};

describe('_app index route', () => {
  it('should redirect to the dashboard, since the app root has no page of its own', () => {
    const thrown = runBeforeLoad();
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/dashboard' } });
  });
});
