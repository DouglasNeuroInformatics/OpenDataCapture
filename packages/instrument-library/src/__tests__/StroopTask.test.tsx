import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StroopTask } from '../interactive/DNP_STROOP_TASK/StroopTask.tsx';

const RANDOM_RED = 0;
const RANDOM_BLUE = 0.3;
const RANDOM_GREEN = 0.5;

function renderStroopTask() {
  return render(<StroopTask done={vi.fn()} />);
}

function advanceSeconds(seconds: number) {
  for (let elapsed = 0; elapsed < seconds; elapsed++) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
}

describe('StroopTask', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(RANDOM_RED);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should draw the word and its ink color independently, so the word can conflict with its color', () => {
    vi.mocked(Math.random).mockReturnValueOnce(RANDOM_RED).mockReturnValueOnce(RANDOM_BLUE);
    renderStroopTask();
    expect(screen.getByRole('heading', { name: 'RED' }).style.color).toBe('blue');
  });

  it('should offer one button per ink color', () => {
    renderStroopTask();
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'RED',
      'BLUE',
      'GREEN',
      'YELLOW'
    ]);
  });

  it('should award a point when the clicked color matches the ink color', () => {
    renderStroopTask();
    fireEvent.click(screen.getByRole('button', { name: 'RED' }));
    expect(screen.getByRole('heading', { name: 'Score: 1' })).toBeTruthy();
  });

  it('should withhold the point when the clicked color differs from the ink color', () => {
    renderStroopTask();
    fireEvent.click(screen.getByRole('button', { name: 'BLUE' }));
    expect(screen.getByRole('heading', { name: 'Score: 0' })).toBeTruthy();
  });

  it('should present a new word after each answer', () => {
    renderStroopTask();
    vi.mocked(Math.random).mockReturnValue(RANDOM_GREEN);
    fireEvent.click(screen.getByRole('button', { name: 'BLUE' }));
    expect(screen.getByRole('heading', { name: 'GREEN' })).toBeTruthy();
  });

  it('should count down one second per tick', () => {
    renderStroopTask();
    advanceSeconds(1);
    expect(screen.getByRole('heading', { name: 'Time Left: 59 seconds' })).toBeTruthy();
  });

  it('should replace the buttons with the final score once time runs out', () => {
    renderStroopTask();
    fireEvent.click(screen.getByRole('button', { name: 'RED' }));
    advanceSeconds(60);
    expect(screen.getByRole('heading', { name: 'Time is up! Your final score is 1' })).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should hold the timer at zero after time runs out, so it never goes negative', () => {
    renderStroopTask();
    advanceSeconds(61);
    expect(screen.getByRole('heading', { name: 'Time Left: 0 seconds' })).toBeTruthy();
  });
});
