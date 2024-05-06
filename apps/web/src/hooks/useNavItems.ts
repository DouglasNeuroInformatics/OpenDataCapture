import { useEffect, useState } from 'react';

import { BarChartBigIcon, CirclePlayIcon, ComputerIcon, DatabaseIcon, EyeIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAppStore } from '@/store';

export type NavItem = {
  [key: `data-${string}`]: unknown;
  disabled?: boolean;
  icon: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  id: string;
  label: string;
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
  const [navItems, setNavItems] = useState<[NavItem[], NavItem[]]>([[], []]);
  const { i18n, t } = useTranslation(['layout', 'core']);

  useEffect(() => {
    const globalItems: NavItem[] = [];
    if (currentUser?.ability.can('read', 'Summary')) {
      globalItems.push({
        'data-cy': 'overview',
        icon: BarChartBigIcon,
        id: '/overview',
        label: t('navLinks.overview')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      globalItems.push({
        'data-cy': 'view-subjects',
        icon: DatabaseIcon,
        id: '/subjects',
        label: t(`navLinks.viewSubjects`)
      });
    }
    if (currentGroup && currentUser?.ability.can('manage', 'Group')) {
      globalItems.push({
        'data-cy': 'manage-group',
        icon: UsersIcon,
        id: '/group/manage',
        label: t('navLinks.manageGroup')
      });
    }

    const sessionItems: NavItem[] = [];
    if (currentUser?.ability.can('create', 'Session')) {
      sessionItems.push({
        'data-cy': 'start-session',
        disabled: currentSession !== null,
        icon: CirclePlayIcon,
        id: '/session/start-session',
        label: t('navLinks.startSession')
      });
    }
    if (currentUser?.ability.can('create', 'InstrumentRecord')) {
      sessionItems.push({
        'data-cy': 'view-instrument',
        disabled: currentSession === null,
        icon: ComputerIcon,
        id: '/instruments/accessible-instruments',
        label: t('navLinks.accessibleInstruments')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      sessionItems.push({
        disabled: currentSession === null,
        icon: EyeIcon,
        id: `/subjects/${currentSession?.subjectId}/table`,
        label: t('navLinks.viewCurrentSubject')
      });
    }
    setNavItems([globalItems, sessionItems]);
  }, [currentSession, currentUser, i18n.resolvedLanguage]);

  return navItems;
}
