import { useEffect, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BarChartBigIcon, CirclePlayIcon, ComputerIcon, DatabaseIcon, EyeIcon, UsersIcon } from 'lucide-react';

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
  const { resolvedLanguage, t } = useTranslation();

  useEffect(() => {
    const globalItems: NavItem[] = [];
    if (currentUser?.ability.can('read', 'Summary')) {
      globalItems.push({
        'data-cy': 'dashboard',
        icon: BarChartBigIcon,
        id: '/dashboard',
        label: t('layout.navLinks.dashboard')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      globalItems.push({
        'data-cy': 'datahub',
        icon: DatabaseIcon,
        id: '/datahub',
        label: t('layout.navLinks.datahub')
      });
    }
    if (currentGroup && currentUser?.ability.can('manage', 'Group')) {
      globalItems.push({
        'data-cy': 'manage-group',
        icon: UsersIcon,
        id: '/group/manage',
        label: t('layout.navLinks.manageGroup')
      });
    }

    const sessionItems: NavItem[] = [];
    if (currentUser?.ability.can('create', 'Session')) {
      sessionItems.push({
        'data-cy': 'start-session',
        disabled: currentSession !== null,
        icon: CirclePlayIcon,
        id: '/session/start-session',
        label: t('layout.navLinks.startSession')
      });
    }
    if (currentUser?.ability.can('create', 'InstrumentRecord')) {
      sessionItems.push({
        'data-cy': 'view-instrument',
        disabled: currentSession === null,
        icon: ComputerIcon,
        id: '/instruments/accessible-instruments',
        label: t('layout.navLinks.accessibleInstruments')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      sessionItems.push({
        disabled: currentSession === null,
        icon: EyeIcon,
        id: `/datahub/${currentSession?.subjectId}/table`,
        label: t('layout.navLinks.viewCurrentSubject')
      });
    }
    setNavItems([globalItems, sessionItems]);
  }, [currentSession, currentUser, resolvedLanguage]);

  return navItems;
}
