import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FeaturesTab } from '../FeaturesTab';

import type { AutosaveSetupState } from '../types';

import '@/services/i18n';

type SetupStateData = {
  isBulkRemoteAssignmentsEnabled?: boolean | null;
  isExperimentalFeaturesEnabled?: boolean | null;
};

const mocks = vi.hoisted(() => ({
  autosave: vi.fn<AutosaveSetupState>(),
  config: { setup: { isGatewayEnabled: true } },
  setupState: {} as SetupStateData
}));

vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: mocks.setupState })
}));

const renderTab = () => render(<FeaturesTab autosave={mocks.autosave} />);

const switchNamed = (name: string) => screen.getByRole('switch', { name });

const sectionLabels = () => screen.getAllByTestId('settings-section').map((section) => section.firstChild?.textContent);

const rowLabels = () => screen.getAllByTestId('setting-row').map((row) => row.querySelector('p')?.textContent);

describe('FeaturesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.config.setup.isGatewayEnabled = true;
    mocks.setupState = {};
  });

  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
  });

  it('should show the uploader as off when the instance has never set it', () => {
    renderTab();
    expect(switchNamed('Enable Uploader').getAttribute('aria-checked')).toBe('false');
  });

  it('should save the uploader as enabled when an admin switches it on', () => {
    renderTab();
    fireEvent.click(switchNamed('Enable Uploader'));
    expect(mocks.autosave).toHaveBeenCalledWith({ isExperimentalFeaturesEnabled: true });
  });

  it('should save the uploader as disabled when an admin switches it off', () => {
    mocks.setupState.isExperimentalFeaturesEnabled = true;
    renderTab();
    fireEvent.click(switchNamed('Enable Uploader'));
    expect(mocks.autosave).toHaveBeenCalledWith({ isExperimentalFeaturesEnabled: false });
  });

  it('should show remote assignments as on when the instance has never set it', () => {
    renderTab();
    expect(switchNamed('Enable Remote Assignments').getAttribute('aria-checked')).toBe('true');
  });

  it('should save remote assignments as disabled when an admin switches them off', () => {
    renderTab();
    fireEvent.click(switchNamed('Enable Remote Assignments'));
    expect(mocks.autosave).toHaveBeenCalledWith({ isBulkRemoteAssignmentsEnabled: false });
  });

  it('should offer the default assignment validity beside the remote assignments switch', () => {
    renderTab();
    expect(screen.getByTestId('default-assignment-duration-input')).toBeTruthy();
  });

  it('should not offer the validity on an instance without the gateway, which cannot create remote assignments', () => {
    mocks.config.setup.isGatewayEnabled = false;
    renderTab();
    expect(screen.queryByTestId('default-assignment-duration-input')).toBeNull();
  });

  // In Spanish both orders differ from the order the sections and rows are written in.
  it('should order the sections by their translated label', () => {
    i18n.changeLanguage('es');
    renderTab();
    expect(sectionLabels()).toStrictEqual(['Carga de datos', 'Tareas remotas']);
  });

  it('should order the settings within a section by their translated label', () => {
    i18n.changeLanguage('es');
    renderTab();
    expect(rowLabels()).toStrictEqual([
      'Activar la carga de datos',
      'Activar las tareas remotas',
      'Validez predeterminada de las tareas (días)'
    ]);
  });
});
