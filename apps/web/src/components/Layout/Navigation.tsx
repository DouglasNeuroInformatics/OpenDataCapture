import { useEffect, useState } from 'react';

import { cn } from '@douglasneuroinformatics/ui';
import { ChartBarIcon, ChartPieIcon, ComputerDesktopIcon, EyeIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useActiveVisitStore } from '@/stores/active-visit-store';
import { useAuthStore } from '@/stores/auth-store';

import { NavButton } from './NavButton';

import type { NavItem } from './types';

export type NavigationProps = {
  btn?: {
    activeClassName: string;
    className: string;
  };
  isAlwaysDark: boolean;
  onNavigate?: (id: string) => void;
  orientation: 'horizontal' | 'vertical';
};

export const Navigation = ({ btn, isAlwaysDark, onNavigate, orientation }: NavigationProps) => {
  const { currentUser } = useAuthStore();
  const { activeVisit } = useActiveVisitStore();

  const [navItems, setNavItems] = useState<NavItem[][]>([]);
  const { i18n, t } = useTranslation('layout');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const globalItems: NavItem[] = [
      {
        'data-cy': 'overview',
        icon: ChartBarIcon,
        id: '/overview',
        label: t('navLinks.overview')
      }
    ];
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      globalItems.push({
        'data-cy': 'view-subjects',
        icon: ChartPieIcon,
        id: '/subjects',
        label: t(`navLinks.viewSubjects`)
      });
    }
    const visitItems: NavItem[] = [];
    if (currentUser?.ability.can('create', 'Visit')) {
      visitItems.push({
        'data-cy': 'add-visit',
        icon: UserPlusIcon,
        id: '/visits/add-visit',
        label: t('navLinks.addVisit')
      });
    }
    if (currentUser?.ability.can('create', 'InstrumentRecord')) {
      visitItems.push({
        'data-cy': 'view-instrument',
        disabled: activeVisit === null,
        icon: ComputerDesktopIcon,
        id: '/instruments/available-instruments',
        label: t('navLinks.availableInstruments')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      visitItems.push({
        disabled: activeVisit === null,
        icon: EyeIcon,
        id: `/subjects/${activeVisit?.subjectId}/table`,
        label: t('navLinks.viewCurrentSubject')
      });
    }
    setNavItems([globalItems, visitItems]);
  }, [activeVisit, currentUser, i18n.resolvedLanguage]);

  return (
    <nav
      className={cn('flex w-full divide-y divide-slate-300 dark:divide-slate-700', {
        'divide-slate-700': isAlwaysDark,
        'flex-col': orientation === 'vertical',
        'justify-end': orientation === 'horizontal'
      })}
    >
      {navItems.map((items, i) => (
        <div className="w-full py-2 first:pt-0 last:pb-0" key={i}>
          {items.map(({ id, ...props }) => (
            <NavButton
              activeClassName={btn?.activeClassName}
              className={btn?.className}
              isActive={location.pathname === id}
              key={id}
              variant={orientation}
              onClick={() => {
                navigate(id);
                onNavigate?.(id);
              }}
              {...props}
            />
          ))}
        </div>
      ))}
    </nav>
  );
};
