// @vitest-environment happy-dom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CompletionRedirect from '../CompletionRedirect';

import '@/services/i18n';

const URL = 'https://example.com/done';

describe('CompletionRedirect', () => {
  let replace: MockInstance<Location['replace']>;

  beforeEach(() => {
    vi.useFakeTimers();
    replace = vi.spyOn(window.location, 'replace').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should count down the seconds before the subject is sent on', () => {
    render(<CompletionRedirect url={URL} />);
    expect(screen.getByTestId('completion-redirect').textContent).toContain('Redirecting in 5…');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('completion-redirect').textContent).toContain('Redirecting in 4…');
  });

  it('should send the subject on once the countdown ends, replacing the assignment in their history', () => {
    render(<CompletionRedirect url={URL} />);
    for (let second = 0; second < 5; second++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(replace).toHaveBeenCalledExactlyOnceWith(URL);
  });

  it('should not send the subject on before the countdown ends', () => {
    render(<CompletionRedirect url={URL} />);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it('should send the subject on at once when they choose to continue', () => {
    render(<CompletionRedirect url={URL} />);
    fireEvent.click(screen.getByRole('link', { name: 'Continue now' }));
    expect(replace).toHaveBeenCalledExactlyOnceWith(URL);
  });

  it('should stop counting once it is gone, so a subject who left is not navigated later', () => {
    const { unmount } = render(<CompletionRedirect url={URL} />);
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
