import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { $UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApplicationSettings } from '../ApplicationSettings';

import type { SettingsTabValue } from '../tabs';
import type { AutosaveSetupState } from '../types';

import '@/services/i18n';

type MutateCallbacks = { onError: () => void; onSuccess: () => void };

const mocks = vi.hoisted(() => ({
  MailTab: vi.fn((_: object) => <div data-testid="mail-tab" />),
  mutate: vi.fn<(data: $UpdateSetupStateData, callbacks: MutateCallbacks) => void>(),
  useUpdateSetupStateMutation: vi.fn()
}));

vi.mock('@/hooks/useUpdateSetupStateMutation', () => ({
  useUpdateSetupStateMutation: (options: unknown) => {
    mocks.useUpdateSetupStateMutation(options);
    return { mutate: mocks.mutate };
  }
}));
vi.mock('../FeaturesTab', () => ({
  FeaturesTab: ({ autosave }: { autosave: AutosaveSetupState }) => (
    <button
      data-testid="features-change"
      type="button"
      onClick={() => autosave({ isExperimentalFeaturesEnabled: true })}
    />
  )
}));
vi.mock('../InterfaceTab', () => ({
  InterfaceTab: ({ autosave }: { autosave: AutosaveSetupState }) => (
    <button data-testid="interface-change" type="button" onClick={() => autosave({ tableColorMode: 'text' })} />
  )
}));
vi.mock('../MailTab', () => ({ MailTab: mocks.MailTab }));

const renderSettings = ({
  onTabChange = vi.fn(),
  tab
}: { onTabChange?: (tab: SettingsTabValue) => void; tab?: SettingsTabValue } = {}) => {
  return render(<ApplicationSettings tab={tab} onTabChange={onTabChange} />);
};

const tabLabels = () => [...screen.getAllByRole('tab')].map((tab) => tab.textContent);

const isShown = (tab: SettingsTabValue) => !screen.getByTestId<HTMLDivElement>(`settings-panel-${tab}`).hidden;

const lastMutateCallbacks = () => mocks.mutate.mock.lastCall![1];

describe('ApplicationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
    vi.useRealTimers();
  });

  describe('tabs', () => {
    // In French the sorted order differs from the order the tabs are written in, so this one
    // assertion tells a sorted list from an unsorted one.
    it('should list the tabs by their translated label, so they read alphabetically in every language', () => {
      i18n.changeLanguage('fr');
      renderSettings();
      expect(tabLabels()).toStrictEqual(['Courriel', 'Fonctionnalités', 'Interface']);
    });

    // In French the first tab by label is not the first written, so this tells the two orders apart.
    it('should open the first tab in label order when the address names none', () => {
      i18n.changeLanguage('fr');
      renderSettings();
      expect(isShown('mail')).toBe(true);
      expect(isShown('features')).toBe(false);
    });

    it('should open the tab the address names', () => {
      renderSettings({ tab: 'mail' });
      expect(isShown('mail')).toBe(true);
      expect(isShown('features')).toBe(false);
    });

    it('should report the chosen tab rather than switch by itself, so the address holds the choice', () => {
      const onTabChange = vi.fn();
      renderSettings({ onTabChange });
      // Radix tabs activate on mouse down, not click.
      fireEvent.mouseDown(screen.getByTestId('settings-tab-mail'), { button: 0 });
      expect(onTabChange).toHaveBeenCalledWith('mail');
      expect(isShown('features')).toBe(true);
    });

    it('should keep a tab that is not shown mounted, so a form not yet saved survives a look at another tab', () => {
      renderSettings({ tab: 'features' });
      expect(screen.getByTestId('mail-tab')).toBeTruthy();
    });

    it('should give an explicit-save tab no autosave, since it saves through its own button', () => {
      renderSettings();
      expect(mocks.MailTab.mock.lastCall?.[0]).toStrictEqual({});
    });
  });

  describe('autosave', () => {
    it('should keep a failed autosave from replacing the page with the error boundary', () => {
      renderSettings();
      expect(mocks.useUpdateSetupStateMutation).toHaveBeenCalledWith({ throwOnError: false });
    });

    it('should save the change an each-change tab reports', () => {
      renderSettings({ tab: 'interface' });
      fireEvent.click(screen.getByTestId('interface-change'));
      expect(mocks.mutate).toHaveBeenCalledWith({ tableColorMode: 'text' }, expect.anything());
    });

    it('should show that a change is saving while the request is in flight', () => {
      renderSettings();
      fireEvent.click(screen.getByTestId('features-change'));
      expect(screen.getByTestId('save-status-saving')).toBeTruthy();
    });

    it('should confirm a change once it has saved', () => {
      renderSettings();
      fireEvent.click(screen.getByTestId('features-change'));
      act(() => lastMutateCallbacks().onSuccess());
      expect(screen.getByTestId('save-status-saved')).toBeTruthy();
    });

    it('should clear the saved confirmation after two seconds', () => {
      vi.useFakeTimers();
      renderSettings();
      fireEvent.click(screen.getByTestId('features-change'));
      act(() => lastMutateCallbacks().onSuccess());
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.queryByTestId('save-status-saved')).toBeNull();
    });

    it('should keep a failed save on screen, so the admin knows the change never landed', () => {
      vi.useFakeTimers();
      renderSettings();
      fireEvent.click(screen.getByTestId('features-change'));
      act(() => lastMutateCallbacks().onError());
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(screen.getByTestId('save-status-error')).toBeTruthy();
    });

    it('should not let the timer of an earlier save clear the status of a later one', () => {
      vi.useFakeTimers();
      renderSettings();
      fireEvent.click(screen.getByTestId('features-change'));
      act(() => lastMutateCallbacks().onSuccess());
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      fireEvent.click(screen.getByTestId('features-change'));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByTestId('save-status-saving')).toBeTruthy();
    });
  });
});
