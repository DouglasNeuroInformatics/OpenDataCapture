import { useEffect, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BarChartBigIcon, CirclePlayIcon, ComputerIcon, DatabaseIcon, EyeIcon, UsersIcon } from 'lucide-react';

import { useAppStore } from '@/store';

export type NavItem = {
  disabled?: boolean;
  icon: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  label: string;
  url: string;
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
        icon: BarChartBigIcon,
        label: t('layout.navLinks.dashboard'),
        url: '/dashboard'
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      globalItems.push({
        icon: DatabaseIcon,
        label: t('layout.navLinks.datahub'),
        url: '/datahub'
      });
    }
    if (currentGroup && currentUser?.ability.can('manage', 'Group')) {
      globalItems.push({
        icon: UsersIcon,
        label: t('layout.navLinks.manageGroup'),
        url: '/group/manage'
      });
    }

    const sessionItems: NavItem[] = [];
    if (currentUser?.ability.can('create', 'Session')) {
      sessionItems.push({
        disabled: currentSession !== null,
        icon: CirclePlayIcon,
        label: t('layout.navLinks.startSession'),
        url: '/session/start-session'
      });
    }
    if (currentUser?.ability.can('create', 'InstrumentRecord')) {
      sessionItems.push({
        disabled: currentSession === null,
        icon: ComputerIcon,
        label: t('layout.navLinks.accessibleInstruments'),
        url: '/instruments/accessible-instruments'
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      sessionItems.push({
        disabled: currentSession === null,
        icon: EyeIcon,
        label: t('layout.navLinks.viewCurrentSubject'),
        url: `/datahub/${currentSession?.subjectId}/table`
      });
    }
    setNavItems([globalItems, sessionItems]);
  }, [currentSession, currentUser, resolvedLanguage]);

  return navItems;
}
