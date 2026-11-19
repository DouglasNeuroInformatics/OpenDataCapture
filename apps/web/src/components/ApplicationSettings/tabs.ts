import { z } from 'zod/v4';

import { mailSettingsQueryOptions } from '@/hooks/useMailSettingsQuery';

import { FeaturesTab } from './FeaturesTab';
import { InterfaceTab } from './InterfaceTab';
import { MailTab } from './MailTab';

import type { SettingsTab } from './types';

// Only infers `TValue` as the union of the tabs' values, which the search schema is typed by.
const defineSettingsTabs = <const TValue extends string>(tabs: readonly SettingsTab<TValue>[]) => tabs;

// Adding a tab is adding an entry. The page orders tabs by their translated label, not as written here.
export const SETTINGS_TABS = defineSettingsTabs([
  {
    Content: FeaturesTab,
    label: { en: 'Features', es: 'Funcionalidades', fr: 'Fonctionnalités' },
    saves: 'each-change',
    value: 'features'
  },
  {
    Content: InterfaceTab,
    label: { en: 'Interface', es: 'Interfaz', fr: 'Interface' },
    saves: 'each-change',
    value: 'interface'
  },
  {
    Content: MailTab,
    label: { en: 'Mail', es: 'Correo', fr: 'Courriel' },
    prefetch: (queryClient) => queryClient.ensureQueryData(mailSettingsQueryOptions()),
    saves: 'explicit',
    value: 'mail'
  }
]);

export type SettingsTabValue = (typeof SETTINGS_TABS)[number]['value'];

// Optional rather than defaulted, so a bare `/admin/settings` opens the default tab without the router
// rewriting the address to name it.
export const $ApplicationSettingsSearch = z.object({
  tab: z
    .enum(SETTINGS_TABS.map(({ value }) => value))
    .optional()
    .catch(undefined)
});
