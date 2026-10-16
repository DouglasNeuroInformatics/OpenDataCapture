import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import type { $UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/settings';
import type { GroupSwitcherPosition } from '@/store/types';

import '@/services/i18n';

type SetupStateData = {
  activeLanguages: ActiveLanguages;
  defaultAssignmentDurationDays?: null | number;
  isBulkRemoteAssignmentsEnabled?: boolean | null;
  isExperimentalFeaturesEnabled?: boolean | null;
};

type MutateCallbacks = { onError: () => void; onSuccess: () => void };

const mocks = vi.hoisted(() => {
  const state: { groupSwitcherPosition: GroupSwitcherPosition; setupState: SetupStateData } = {
    groupSwitcherPosition: 'sidebar',
    setupState: { activeLanguages: ['en'] }
  };
  return {
    config: { setup: { isGatewayEnabled: true } },
    mutate: vi.fn<(data: $UpdateSetupStateData, callbacks: MutateCallbacks) => void>(),
    setGroupSwitcherPosition: vi.fn<(position: GroupSwitcherPosition) => void>(),
    state,
    useUpdateSetupStateMutation: vi.fn()
  };
});

vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: mocks.state.setupState })
}));
vi.mock('@/hooks/useUpdateSetupStateMutation', () => ({
  useUpdateSetupStateMutation: (options: unknown) => {
    mocks.useUpdateSetupStateMutation(options);
    return { mutate: mocks.mutate };
  }
}));
vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(
    selector: (store: {
      groupSwitcherPosition: GroupSwitcherPosition;
      setGroupSwitcherPosition: typeof mocks.setGroupSwitcherPosition;
    }) => TSelected
  ) =>
    selector({
      groupSwitcherPosition: mocks.state.groupSwitcherPosition,
      setGroupSwitcherPosition: mocks.setGroupSwitcherPosition
    })
}));

const Page = Route.options.component!;

const renderPage = () => render(<Page />);

const durationInput = () => screen.getByTestId<HTMLInputElement>('default-assignment-duration-input');

const typeDuration = (value: string) => fireEvent.change(durationInput(), { target: { value } });

const lastMutateCallbacks = () => mocks.mutate.mock.lastCall![1];

const savedData = () => mocks.mutate.mock.calls.map(([data]) => data);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.config.setup.isGatewayEnabled = true;
  mocks.state.groupSwitcherPosition = 'sidebar';
  mocks.state.setupState = { activeLanguages: ['en'] };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('admin settings route', () => {
  it('should keep a failed autosave from replacing the page with the error boundary', () => {
    renderPage();
    expect(mocks.useUpdateSetupStateMutation).toHaveBeenCalledWith({ throwOnError: false });
  });

  describe('feature toggles', () => {
    it('should show the uploader as off when the instance has never set it', () => {
      renderPage();
      expect(screen.getByRole('switch', { name: 'Enable Uploader' }).getAttribute('aria-checked')).toBe('false');
    });

    it('should save the uploader as enabled when an admin switches it on', () => {
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
      expect(mocks.mutate).toHaveBeenCalledWith({ isExperimentalFeaturesEnabled: true }, expect.anything());
    });

    it('should save the uploader as disabled when an admin switches it off', () => {
      mocks.state.setupState.isExperimentalFeaturesEnabled = true;
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
      expect(mocks.mutate).toHaveBeenCalledWith({ isExperimentalFeaturesEnabled: false }, expect.anything());
    });

    it('should show remote assignments as on when the instance has never set it', () => {
      renderPage();
      const toggle = screen.getByRole('switch', { name: 'Enable Remote Assignments' });
      expect(toggle.getAttribute('aria-checked')).toBe('true');
    });

    it('should save remote assignments as disabled when an admin switches them off', () => {
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Remote Assignments' }));
      expect(mocks.mutate).toHaveBeenCalledWith({ isBulkRemoteAssignmentsEnabled: false }, expect.anything());
    });
  });

  describe('save status', () => {
    it('should show that a change is saving while the request is in flight', () => {
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
      expect(screen.getByTestId('save-status-saving')).toBeTruthy();
    });

    it('should confirm a change once it has saved', () => {
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
      act(() => lastMutateCallbacks().onSuccess());
      expect(screen.getByTestId('save-status-saved')).toBeTruthy();
    });

    it('should clear the saved confirmation after two seconds', () => {
      vi.useFakeTimers();
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
      act(() => lastMutateCallbacks().onSuccess());
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.queryByTestId('save-status-saved')).toBeNull();
    });

    it('should keep a failed save on screen, so the admin knows the change never landed', () => {
      vi.useFakeTimers();
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
      act(() => lastMutateCallbacks().onError());
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(screen.getByTestId('save-status-error')).toBeTruthy();
    });

    it('should not let the timer of an earlier save clear the status of a later one', () => {
      vi.useFakeTimers();
      renderPage();
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
      act(() => lastMutateCallbacks().onSuccess());
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      fireEvent.click(screen.getByRole('switch', { name: 'Enable Remote Assignments' }));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByTestId('save-status-saving')).toBeTruthy();
    });
  });

  describe('default assignment duration', () => {
    it('should not offer the duration on an instance without the gateway, which cannot create remote assignments', () => {
      mocks.config.setup.isGatewayEnabled = false;
      renderPage();
      expect(screen.queryByTestId('default-assignment-duration-input')).toBeNull();
    });

    it('should show the built-in default when the instance has never set one', () => {
      renderPage();
      expect(durationInput().value).toBe('365');
    });

    it('should show the duration the instance has saved', () => {
      mocks.state.setupState.defaultAssignmentDurationDays = 30;
      renderPage();
      expect(durationInput().value).toBe('30');
    });

    it('should save a typed duration once the admin pauses', () => {
      vi.useFakeTimers();
      renderPage();
      typeDuration('30');
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
    });

    it('should wait for the admin to stop typing before saving, so each keystroke is not saved', () => {
      vi.useFakeTimers();
      renderPage();
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
      renderPage();
      typeDuration('365');
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(mocks.mutate).not.toHaveBeenCalled();
    });

    it('should not save a typed duration that is out of range', () => {
      vi.useFakeTimers();
      renderPage();
      typeDuration('0');
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(mocks.mutate).not.toHaveBeenCalled();
    });

    it('should save a changed duration immediately on blur, without waiting for the pause', () => {
      vi.useFakeTimers();
      renderPage();
      typeDuration('30');
      fireEvent.blur(durationInput());
      expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(mocks.mutate).toHaveBeenCalledOnce();
    });

    it('should normalize the typed duration on blur to the number that was saved', () => {
      renderPage();
      typeDuration('030');
      fireEvent.blur(durationInput());
      expect(durationInput().value).toBe('30');
    });

    it('should restore the saved duration on blur when the typed one is invalid', () => {
      mocks.state.setupState.defaultAssignmentDurationDays = 30;
      renderPage();
      typeDuration('99999');
      fireEvent.blur(durationInput());
      expect(durationInput().value).toBe('30');
      expect(mocks.mutate).not.toHaveBeenCalled();
    });

    it('should not save on blur when the duration is unchanged', () => {
      renderPage();
      fireEvent.blur(durationInput());
      expect(durationInput().value).toBe('365');
      expect(mocks.mutate).not.toHaveBeenCalled();
    });

    it('should commit the duration when the admin presses enter', () => {
      renderPage();
      durationInput().focus();
      typeDuration('30');
      fireEvent.keyDown(durationInput(), { key: 'Enter' });
      expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
    });

    it('should keep the input focused for keys other than enter', () => {
      renderPage();
      durationInput().focus();
      fireEvent.keyDown(durationInput(), { key: '5' });
      expect(document.activeElement).toBe(durationInput());
    });

    it('should save a pending duration on unmount, so navigating away does not lose it', () => {
      const { unmount } = renderPage();
      typeDuration('30');
      unmount();
      expect(savedData()).toEqual([{ defaultAssignmentDurationDays: 30 }]);
    });

    it('should show the new saved duration when the server value changes underneath the input', () => {
      const { rerender } = renderPage();
      mocks.state.setupState = { ...mocks.state.setupState, defaultAssignmentDurationDays: 14 };
      rerender(<Page />);
      expect(durationInput().value).toBe('14');
    });
  });

  describe('languages', () => {
    it('should check each active language', () => {
      mocks.state.setupState.activeLanguages = ['en', 'fr'];
      renderPage();
      expect(screen.getByTestId('active-language-en').getAttribute('aria-checked')).toBe('true');
      expect(screen.getByTestId('active-language-es').getAttribute('aria-checked')).toBe('false');
    });

    it('should save an activated language in canonical order, regardless of the order it was clicked', () => {
      mocks.state.setupState.activeLanguages = ['fr'];
      renderPage();
      fireEvent.click(screen.getByTestId('active-language-en'));
      expect(savedData()).toEqual([{ activeLanguages: ['en', 'fr'] }]);
    });

    it('should save the remaining languages when one is deactivated', () => {
      mocks.state.setupState.activeLanguages = ['en', 'fr'];
      renderPage();
      fireEvent.click(screen.getByTestId('active-language-en'));
      expect(savedData()).toEqual([{ activeLanguages: ['fr'] }]);
    });

    it('should not let the only active language be deactivated', () => {
      renderPage();
      expect(screen.getByTestId<HTMLButtonElement>('active-language-en').disabled).toBe(true);
    });

    it('should never save an empty language list, even when the stored list repeats its only language', () => {
      mocks.state.setupState.activeLanguages = ['en', 'en'];
      renderPage();
      fireEvent.click(screen.getByTestId('active-language-en'));
      expect(mocks.mutate).not.toHaveBeenCalled();
    });
  });

  describe('group switcher position', () => {
    it('should show the position this browser has stored', () => {
      mocks.state.groupSwitcherPosition = 'topbar';
      renderPage();
      expect(screen.getByTestId('group-switcher-position-select').textContent).toBe('Top Right Corner');
    });

    it('should store the position the admin chooses', () => {
      renderPage();
      fireEvent.keyDown(screen.getByTestId('group-switcher-position-select'), { key: 'Enter' });
      fireEvent.click(screen.getByRole('option', { name: 'Top Right Corner' }));
      expect(mocks.setGroupSwitcherPosition).toHaveBeenCalledWith('topbar');
    });
  });
});
