// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CapWidget from '../Cap';

import '@/services/i18n';

vi.mock('@cap.js/widget', () => ({}));

function dispatchSolve(element: Element, token: string) {
  element.dispatchEvent(new CustomEvent('solve', { detail: { token } }));
}

describe('CapWidget', () => {
  afterEach(() => {
    cleanup();
  });

  it('should point the widget at the gateway auth endpoint, where the challenge is issued and redeemed', () => {
    const { container } = render(<CapWidget onSolve={vi.fn()} />);
    expect(container.querySelector('cap-widget')?.getAttribute('data-cap-api-endpoint')).toBe('/api/auth/');
  });

  it('should label every widget state, since the widget renders no text of its own', () => {
    const { container } = render(<CapWidget onSolve={vi.fn()} />);
    const widget = container.querySelector('cap-widget');
    expect(widget?.getAttribute('data-cap-i18n-initial-state')).toBe("I'm a human");
    expect(widget?.getAttribute('data-cap-i18n-solved-label')).toBe("I'm a human");
    expect(widget?.getAttribute('data-cap-i18n-error-label')).toBe('Error');
  });

  it('should pass the token from a solved challenge to the caller', () => {
    const onSolve = vi.fn();
    const { container } = render(<CapWidget onSolve={onSolve} />);
    dispatchSolve(container.querySelector('cap-widget')!, 'token-1');
    expect(onSolve).toHaveBeenCalledWith('token-1');
  });
});
