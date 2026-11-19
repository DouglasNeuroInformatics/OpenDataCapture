import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DefaultAssignmentDurationInput } from '../DefaultAssignmentDurationInput';

import type { AutosaveSetupState } from '../types';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  autosave: vi.fn<AutosaveSetupState>(),
  setupState: {} as { defaultAssignmentDurationDays?: null | number }
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: mocks.setupState })
}));

const renderInput = () => render(<DefaultAssignmentDurationInput autosave={mocks.autosave} />);

const durationInput = () => screen.getByTestId<HTMLInputElement>('default-assignment-duration-input');

const typeDuration = (value: string) => fireEvent.change(durationInput(), { target: { value } });

const savedData = () => mocks.autosave.mock.calls.map(([data]) => data);

describe('DefaultAssignmentDurationInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setupState = {};
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should show the built-in default when the instance has never set one', () => {
    renderInput();
    expect(durationInput().value).toBe('365');
  });

  it('should show the duration the instance has saved', () => {
    mocks.setupState.defaultAssignmentDurationDays = 30;
    renderInput();
    expect(durationInput().value).toBe('30');
  });

  it('should save a typed duration once the admin pauses', () => {
    vi.useFakeTimers();
    renderInput();
    typeDuration('30');
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
  });

  it('should wait for the admin to stop typing before saving, so each keystroke is not saved', () => {
    vi.useFakeTimers();
    renderInput();
    typeDuration('3');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    typeDuration('30');
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
  });

  it('should not save a typed duration that matches the saved one', () => {
    vi.useFakeTimers();
    renderInput();
    typeDuration('365');
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(mocks.autosave).not.toHaveBeenCalled();
  });

  it('should not save a typed duration that is out of range', () => {
    vi.useFakeTimers();
    renderInput();
    typeDuration('0');
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(mocks.autosave).not.toHaveBeenCalled();
  });

  it('should save a changed duration immediately on blur, without waiting for the pause', () => {
    vi.useFakeTimers();
    renderInput();
    typeDuration('30');
    fireEvent.blur(durationInput());
    expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(mocks.autosave).toHaveBeenCalledOnce();
  });

  it('should normalize the typed duration on blur to the number that was saved', () => {
    renderInput();
    typeDuration('030');
    fireEvent.blur(durationInput());
    expect(durationInput().value).toBe('30');
  });

  it('should restore the saved duration on blur when the typed one is invalid', () => {
    mocks.setupState.defaultAssignmentDurationDays = 30;
    renderInput();
    typeDuration('99999');
    fireEvent.blur(durationInput());
    expect(durationInput().value).toBe('30');
    expect(mocks.autosave).not.toHaveBeenCalled();
  });

  it('should not save on blur when the duration is unchanged', () => {
    renderInput();
    fireEvent.blur(durationInput());
    expect(durationInput().value).toBe('365');
    expect(mocks.autosave).not.toHaveBeenCalled();
  });

  it('should commit the duration when the admin presses enter', () => {
    renderInput();
    durationInput().focus();
    typeDuration('30');
    fireEvent.keyDown(durationInput(), { key: 'Enter' });
    expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
  });

  it('should keep the input focused for keys other than enter', () => {
    renderInput();
    durationInput().focus();
    fireEvent.keyDown(durationInput(), { key: '5' });
    expect(document.activeElement).toBe(durationInput());
  });

  it('should save a pending duration on unmount, so navigating away does not lose it', () => {
    const { unmount } = renderInput();
    typeDuration('30');
    unmount();
    expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
  });

  it('should show the new saved duration when the server value changes underneath the input', () => {
    const { rerender } = renderInput();
    mocks.setupState = { defaultAssignmentDurationDays: 14 };
    rerender(<DefaultAssignmentDurationInput autosave={mocks.autosave} />);
    expect(durationInput().value).toBe('14');
  });
});
