import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { DEMO_USERS } from '@opendatacapture/demo';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DemoBanner } from '@/components/DemoBanner';

import '@/services/i18n';

describe('DemoBanner', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  const dismiss = () => fireEvent.keyDown(document.body, { key: 'Escape' });

  it('should open the demo information on first render, so a visitor sees the credentials without looking for them', () => {
    render(<DemoBanner onLogin={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Demo Information' })).toBeTruthy();
  });

  it('should close the demo information when dismissed, so the login form is reachable', () => {
    render(<DemoBanner onLogin={vi.fn()} />);
    screen.getByRole('dialog');
    dismiss();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should reopen the demo information from the banner after it was dismissed', () => {
    render(<DemoBanner onLogin={vi.fn()} />);
    dismiss();
    fireEvent.click(screen.getByRole('button', { name: 'How to Use?' }));
    expect(screen.getByRole('dialog', { name: 'Demo Information' })).toBeTruthy();
  });

  it("should log in with the credentials of whichever demo user's row was chosen, so every listed account works", () => {
    const onLogin = vi.fn();
    render(<DemoBanner onLogin={onLogin} />);
    for (const { username } of DEMO_USERS) {
      fireEvent.click(within(screen.getByRole('row', { name: new RegExp(username) })).getByRole('button'));
    }
    expect(onLogin.mock.calls).toEqual(DEMO_USERS.map(({ password, username }) => [{ password, username }]));
  });
});
