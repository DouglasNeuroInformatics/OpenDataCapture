import { describe, expect, it, vi } from 'vitest';

import { LoginPageEditor } from '@/components/LoginPageEditor';
import { Route } from '@/routes/_app/admin/branding/login-page';

vi.mock('@/components/LoginPageEditor', () => ({ LoginPageEditor: () => null }));

describe('login page branding route', () => {
  it('should render the login page editor, so the route adds nothing around it', () => {
    expect(Route.options.component).toBe(LoginPageEditor);
  });
});
