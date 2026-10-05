import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WithFallback } from '@/components/WithFallback';

type GreetingProps = { data: { name: string } };

const Greeting = ({ data }: GreetingProps) => <p data-testid="greeting">{data.name}</p>;

const renderGreeting = (data: GreetingProps['data'] | null, minDelay?: number) => {
  return render(<WithFallback Component={Greeting} minDelay={minDelay} props={{ data }} />);
};

const isShowingFallback = () => document.querySelector('.animate-spinner') !== null;

describe('WithFallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should render the component immediately when the data is already loaded, so cached pages do not flash a spinner', () => {
    renderGreeting({ name: 'Ada' });
    expect(screen.getByTestId('greeting').textContent).toBe('Ada');
  });

  it('should show the fallback while the data is loading', () => {
    renderGreeting(null);
    expect(isShowingFallback()).toBe(true);
  });

  it('should treat undefined data as still loading', () => {
    render(<WithFallback Component={Greeting} props={{ data: undefined }} />);
    expect(isShowingFallback()).toBe(true);
  });

  it('should keep the fallback for the default minimum delay when the data arrives early, so the spinner never flickers', () => {
    const { rerender } = renderGreeting(null);
    rerender(<WithFallback Component={Greeting} props={{ data: { name: 'Ada' } }} />);
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(isShowingFallback()).toBe(true);
  });

  it('should render the component once the default minimum delay has elapsed and the data has arrived', () => {
    const { rerender } = renderGreeting(null);
    rerender(<WithFallback Component={Greeting} props={{ data: { name: 'Ada' } }} />);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId('greeting').textContent).toBe('Ada');
  });

  it('should honour a custom minimum delay', () => {
    const { rerender } = renderGreeting(null, 1000);
    rerender(<WithFallback Component={Greeting} minDelay={1000} props={{ data: { name: 'Ada' } }} />);
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(isShowingFallback()).toBe(true);
  });

  it('should keep the fallback after the delay while the data is still missing', () => {
    renderGreeting(null);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(isShowingFallback()).toBe(true);
  });

  it('should cancel the pending delay on unmount, so no state update fires on an unmounted component', () => {
    const { unmount } = renderGreeting(null);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
