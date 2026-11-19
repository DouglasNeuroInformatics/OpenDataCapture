import type React from 'react';

import type { Language } from '@opendatacapture/schemas/core';
import type { $UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import type { QueryClient } from '@tanstack/react-query';

type SettingsTabBase<TValue extends string> = {
  label: { [L in Language]: string };
  /** Called by the route's loader, so a tab whose `Content` reads a query renders without suspending. */
  prefetch?: (queryClient: QueryClient) => Promise<unknown>;
  /** The tab's `?tab=` value in the address. */
  value: TValue;
};

export type AutosaveSetupState = (data: $UpdateSetupStateData) => void;

/**
 * `saves` decides how a tab keeps its changes. An `each-change` tab is handed `autosave`, which saves
 * one change at a time and drives the page's save status. An `explicit` tab holds its own form and
 * saves it with its own button.
 */
export type SettingsTab<TValue extends string> = SettingsTabBase<TValue> &
  (
    | { Content: React.ComponentType; saves: 'explicit' }
    | { Content: React.ComponentType<{ autosave: AutosaveSetupState }>; saves: 'each-change' }
  );
