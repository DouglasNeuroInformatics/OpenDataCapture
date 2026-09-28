import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
});
