import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import instrument from '../interactive/DNP_STROOP_TASK/index.tsx';
import { StroopTask } from '../interactive/DNP_STROOP_TASK/StroopTask.tsx';

vi.mock('../interactive/DNP_STROOP_TASK/StroopTask.tsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../interactive/DNP_STROOP_TASK/StroopTask.tsx')>();
  return { StroopTask: vi.fn(actual.StroopTask) };
});

function render(done: (data: { score: number }) => void) {
  act(() => {
    instrument.content.render(done);
  });
}

afterEach(() => {
  document.body.replaceChildren();
  vi.clearAllMocks();
});

describe('DNP_STROOP_TASK', () => {
  it('should mount the stroop task into the document body', () => {
    render(vi.fn());
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Stroop Task');
  });

  it('should forward the score the task reports to the done callback', () => {
    const done = vi.fn();
    render(done);
    const [props] = vi.mocked(StroopTask).mock.calls[0]!;
    props.done({ score: 7 });
    expect(done).toHaveBeenCalledWith({ score: 7 });
  });

  it('should accept an integer score and reject a fractional one', () => {
    expect(instrument.validationSchema.safeParse({ score: 3 }).success).toBe(true);
    expect(instrument.validationSchema.safeParse({ score: 3.5 }).success).toBe(false);
  });
});
