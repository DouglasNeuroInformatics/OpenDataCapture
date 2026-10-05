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

  it('should brand the demo information with the Open Data Capture logo and name, as on the public site', () => {
    render(<DemoBanner onLogin={vi.fn()} />);
    const branding = within(screen.getByRole('dialog')).getByTestId('demo-dialog-branding');
    expect(branding.querySelector('svg')).toBeTruthy();
    expect(branding.textContent).toBe('Open Data Capture');
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

  it('should log in from a click anywhere in the row, so the whole row is the target and not just its button', () => {
    const onLogin = vi.fn();
    render(<DemoBanner onLogin={onLogin} />);
    for (const { username } of DEMO_USERS) {
      const cells = within(screen.getByRole('row', { name: new RegExp(username) })).getAllByRole('cell');
      fireEvent.click(cells[0]!);
    }
    expect(onLogin.mock.calls).toEqual(DEMO_USERS.map(({ password, username }) => [{ password, username }]));
  });

  it('should log in once for a click on the row button, so the row and the button do not both fire', () => {
    const onLogin = vi.fn();
    render(<DemoBanner onLogin={onLogin} />);
    const { password, username } = DEMO_USERS[0]!;
    fireEvent.click(within(screen.getByRole('row', { name: new RegExp(username) })).getByRole('button'));
    expect(onLogin).toHaveBeenCalledExactlyOnceWith({ password, username });
  });
});
