import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/group/email-templates';

import '@/services/i18n';

vi.mock('@/components/GroupEmailTemplates', () => ({
  GroupEmailTemplates: () => <div data-testid="group-email-templates" />
}));

afterEach(cleanup);

describe('group email templates route', () => {
  it('should title the page and render the group email template manager beneath it', () => {
    const Component = Route.options.component!;
    render(<Component />);
    expect(screen.getByTestId('page-header').textContent).toBe('Email Templates');
    expect(screen.getByTestId('group-email-templates')).toBeTruthy();
  });
});
