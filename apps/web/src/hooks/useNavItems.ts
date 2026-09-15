import React, { useEffect, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import {
  BarChartBigIcon,
  CirclePlayIcon,
  CogIcon,
  ComputerIcon,
  DatabaseIcon,
  EyeIcon,
  LogsIcon,
  MailIcon,
  PackageIcon,
  PaletteIcon,
  SendIcon,
  ShieldIcon,
  UploadIcon,
  UserCogIcon,
  UsersIcon
} from 'lucide-react';

import { config } from '@/config';
import { useAppStore } from '@/store';

import { useSetupStateQuery } from './useSetupStateQuery';

export type NavItem = {
  /** When present, this item renders as a collapsible group rather than a link. */
  children?: NavItem[];
  disabled?: boolean;
  icon: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  label: string;
  /** The route to navigate to. Omitted for collapsible group headers. */
  url?: string;
};

/**
 * Generates the nav items for the current user, group, and session. This is displayed by the sidebar
 * or navbar, depending on the size of the user's device.
 *
 * @returns - a tuple consisting of an array of global and session nav items respectively
 */
export function useNavItems() {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);
  const currentUser = useAppStore((store) => store.currentUser);
  const [navItems, setNavItems] = useState<NavItem[][]>([[], []]);
  const { resolvedLanguage, t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();

  useEffect(() => {
    const ability = currentUser?.ability;
    const globalItems: NavItem[] = [];
    if (
      ability?.can('read', 'Instrument') &&
      ability.can('read', 'InstrumentRecord') &&
      ability.can('read', 'Subject') &&
      ability.can('read', 'User')
    ) {
      globalItems.push({
        icon: BarChartBigIcon,
        label: t('layout.navLinks.dashboard'),
        url: '/dashboard'
      });
    }
    if (ability?.can('read', 'Subject') && ability.can('read', 'InstrumentRecord')) {
      globalItems.push({
        icon: DatabaseIcon,
        label: t('layout.navLinks.datahub'),
        url: '/datahub'
      });
    }
    if (
      ability?.can('read', 'Subject') &&
      ability.can('create', 'InstrumentRecord') &&
      setupStateQuery.data.isExperimentalFeaturesEnabled
    ) {
      globalItems.push({
        icon: UploadIcon,
        label: t(`layout.navLinks.upload`),
        url: '/upload'
      });
    }
    // The bulk page is behind an instance toggle. With it off, the group links stay exactly where
    // they were — two flat entries — so an instance that never turns this on sees no change at all.
    // With it on they collapse into one group, whose children are gated independently: bulk assignment
    // needs abilities managing a group does not, and holding only one of them must still surface it.
    const isBulkEnabled = Boolean(setupStateQuery.data.isBulkRemoteAssignmentsEnabled);
    const groupItems: NavItem[] = [];
    if (currentGroup && ability?.can('manage', 'Group')) {
      groupItems.push({
        icon: UsersIcon,
        label: t('layout.navLinks.manageGroup'),
        url: '/group/manage'
      });
      // These templates exist only to email a remote assignment link, which the gateway serves
      if (setupStateQuery.data.isMailEnabled && config.setup.isGatewayEnabled) {
        groupItems.push({
          icon: MailIcon,
          label: t({ en: 'Email Templates', fr: 'Modèles de courriel' }),
          url: '/group/email-templates'
        });
      }
    }
    if (
      isBulkEnabled &&
      currentGroup &&
      config.setup.isGatewayEnabled &&
      ability?.can('create', 'Assignment') &&
      ability.can('read', 'Assignment') &&
      ability.can('read', 'Subject')
    ) {
      groupItems.push({
        icon: SendIcon,
        label: t({ en: 'Bulk Remote Assignments', fr: 'Tâches à distance en lot' }),
        url: '/group/bulk-remote-assignments'
      });
    }
    if (groupItems.length > 0) {
      if (isBulkEnabled) {
        globalItems.push({
          children: groupItems,
          icon: UsersIcon,
          label: t({ en: 'Group Actions', fr: 'Actions de groupe' })
        });
      } else {
        globalItems.push(...groupItems);
      }
    }

    if (ability?.can('manage', 'all')) {
      globalItems.push({
        icon: UsersIcon,
        label: t({
          en: 'Manage Groups',
          fr: 'Gérer les groupes'
        }),
        url: '/admin/groups'
      });
      globalItems.push({
        icon: UserCogIcon,
        label: t({
          en: 'Manage Users',
          fr: 'Gérer les utilisateurs'
        }),
        url: '/admin/users'
      });
    }

    const adminItems: NavItem[] = [];
    if (ability?.can('manage', 'all')) {
      adminItems.push({
        children: [
          {
            icon: CogIcon,
            label: t({
              en: 'App Settings',
              fr: "Paramètres de l'application"
            }),
            url: '/admin/settings'
          },
          {
            icon: LogsIcon,
            label: t('common.auditLogs'),
            url: '/admin/audit/logs'
          },
          {
            icon: PaletteIcon,
            label: t({
              en: 'Branding',
              fr: 'Image de marque'
            }),
            url: '/admin/branding'
          },
          {
            icon: PackageIcon,
            label: t({
              en: 'Instrument Repos',
              fr: "Dépôts d'instruments"
            }),
            url: '/admin/instrument-repos'
          },
          {
            icon: MailIcon,
            label: t({ en: 'Mail', fr: 'Courriel' }),
            url: '/admin/mail'
          }
        ],
        icon: ShieldIcon,
        label: t({ en: 'Admin Panel', fr: "Panneau d'administration" })
      });
    }

    const sessionItems: NavItem[] = [];
    if (ability?.can('create', 'Session')) {
      sessionItems.push({
        disabled: currentSession !== null,
        icon: CirclePlayIcon,
        label: t('layout.navLinks.startSession'),
        url: '/session/start-session'
      });
    }
    if (ability?.can('create', 'InstrumentRecord')) {
      sessionItems.push({
        disabled: currentSession === null,
        icon: ComputerIcon,
        label: t('layout.navLinks.accessibleInstruments'),
        url: '/instruments/accessible-instruments'
      });
    }
    // Remote assignment requires the gateway to be enabled, since assignments are served through it
    if (ability?.can('create', 'Assignment') && config.setup.isGatewayEnabled) {
      sessionItems.push({
        disabled: currentSession === null,
        icon: SendIcon,
        label: t('layout.navLinks.remoteAssignment'),
        url: '/session/remote-assignment'
      });
    }
    if (ability?.can('read', 'Subject') && ability.can('read', 'InstrumentRecord')) {
      sessionItems.push({
        disabled: currentSession === null,
        icon: EyeIcon,
        label: t('layout.navLinks.viewCurrentSubject'),
        url: `/datahub/${currentSession?.subjectId}/table`
      });
    }
    setNavItems([globalItems, adminItems, sessionItems].filter((arr) => arr.length));
  }, [
    currentSession,
    currentUser,
    resolvedLanguage,
    setupStateQuery.data.isBulkRemoteAssignmentsEnabled,
    setupStateQuery.data.isExperimentalFeaturesEnabled,
    setupStateQuery.data.isMailEnabled
  ]);

  return navItems;
}
