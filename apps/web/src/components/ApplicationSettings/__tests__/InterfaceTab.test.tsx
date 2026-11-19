import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import type { TableColorMode } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GroupSwitcherPosition } from '@/store/types';

import { InterfaceTab } from '../InterfaceTab';

import type { AutosaveSetupState } from '../types';

import '@/services/i18n';

type SetupStateData = { activeLanguages: ActiveLanguages; tableColorMode: TableColorMode };

const mocks = vi.hoisted(() => {
  const state: { groupSwitcherPosition: GroupSwitcherPosition; setupState: SetupStateData } = {
    groupSwitcherPosition: 'sidebar',
    setupState: { activeLanguages: ['en'], tableColorMode: 'tags' }
  };
  return {
    autosave: vi.fn<AutosaveSetupState>(),
    setGroupSwitcherPosition: vi.fn<(position: GroupSwitcherPosition) => void>(),
    state
  };
});

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: mocks.state.setupState })
}));
vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(
    selector: (store: {
      groupSwitcherPosition: GroupSwitcherPosition;
      setGroupSwitcherPosition: typeof mocks.setGroupSwitcherPosition;
    }) => TSelected
  ) => {
    return selector({
      groupSwitcherPosition: mocks.state.groupSwitcherPosition,
      setGroupSwitcherPosition: mocks.setGroupSwitcherPosition
    });
  }
}));

const renderTab = () => render(<InterfaceTab autosave={mocks.autosave} />);

const savedData = () => mocks.autosave.mock.calls.map(([data]) => data);

describe('InterfaceTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.groupSwitcherPosition = 'sidebar';
    mocks.state.setupState = { activeLanguages: ['en'], tableColorMode: 'tags' };
  });

  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
  });

  // In French the sorted order differs from the order the settings are written in.
  it('should order the settings by their translated label', () => {
    i18n.changeLanguage('fr');
    renderTab();
    expect(screen.getAllByTestId('settings-section').map((section) => section.firstChild?.textContent)).toStrictEqual([
      'Langues',
      'Position du sélecteur de groupe',
      'Texte coloré dans les tableaux'
    ]);
  });

  describe('languages', () => {
    it('should check each active language', () => {
      mocks.state.setupState.activeLanguages = ['en', 'fr'];
      renderTab();
      expect(screen.getByTestId('active-language-en').getAttribute('aria-checked')).toBe('true');
      expect(screen.getByTestId('active-language-es').getAttribute('aria-checked')).toBe('false');
    });

    it('should save an activated language in canonical order, regardless of the order it was clicked', () => {
      mocks.state.setupState.activeLanguages = ['fr'];
      renderTab();
      fireEvent.click(screen.getByTestId('active-language-en'));
      expect(savedData()).toEqual([{ activeLanguages: ['en', 'fr'] }]);
    });

    it('should save the remaining languages when one is deactivated', () => {
      mocks.state.setupState.activeLanguages = ['en', 'fr'];
      renderTab();
      fireEvent.click(screen.getByTestId('active-language-en'));
      expect(savedData()).toEqual([{ activeLanguages: ['fr'] }]);
    });

    it('should not let the only active language be deactivated', () => {
      renderTab();
      expect(screen.getByTestId<HTMLButtonElement>('active-language-en').disabled).toBe(true);
    });

    // In English the sorted order differs from the canonical `LANGUAGES` order, so this one
    // assertion tells a sorted list from an unsorted one.
    it('should list the languages by their translated name, so a long list is scannable', () => {
      renderTab();
      expect(
        [...screen.getByTestId('active-languages').querySelectorAll('label')].map((label) => label.textContent)
      ).toStrictEqual(['English', 'French', 'Spanish']);
    });

    it('should never save an empty language list, even when the stored list repeats its only language', () => {
      mocks.state.setupState.activeLanguages = ['en', 'en'];
      renderTab();
      fireEvent.click(screen.getByTestId('active-language-en'));
      expect(mocks.autosave).not.toHaveBeenCalled();
    });
  });

  describe('table colors', () => {
    it('should show the saved mode', () => {
      mocks.state.setupState.tableColorMode = 'none';
      renderTab();
      expect(screen.getByTestId('table-color-mode-select').textContent).toContain('Disabled');
    });

    it('should autosave the chosen mode, since the setting has no submit button', () => {
      renderTab();
      fireEvent.keyDown(screen.getByTestId('table-color-mode-select'), { key: 'Enter' });
      fireEvent.click(screen.getByTestId('table-color-mode-option-text'));
      expect(savedData()).toEqual([{ tableColorMode: 'text' }]);
    });
  });

  describe('group switcher position', () => {
    it('should show the position this browser has stored', () => {
      mocks.state.groupSwitcherPosition = 'topbar';
      renderTab();
      expect(screen.getByTestId('group-switcher-position-select').textContent).toBe('Top Right Corner');
    });

    it('should store the position the admin chooses in this browser, not on the instance', () => {
      renderTab();
      fireEvent.keyDown(screen.getByTestId('group-switcher-position-select'), { key: 'Enter' });
      fireEvent.click(screen.getByRole('option', { name: 'Top Right Corner' }));
      expect(mocks.setGroupSwitcherPosition).toHaveBeenCalledWith('topbar');
      expect(mocks.autosave).not.toHaveBeenCalled();
    });
  });
});
