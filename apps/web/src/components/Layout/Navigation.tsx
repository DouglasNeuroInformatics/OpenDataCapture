import React, { useEffect, useState } from 'react';

import { Button, LegacyModal } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import {
  ChartBarIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  EyeIcon,
  StopIcon,
  UserPlusIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppStore } from '@/store';

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
  const currentSession = useAppStore((store) => store.currentSession);
  const currentUser = useAppStore((store) => store.currentUser);
  const endSession = useAppStore((store) => store.endSession);

  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);

  const [navItems, setNavItems] = useState<NavItem[][]>([]);
  const { i18n, t } = useTranslation(['layout', 'core']);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    currentUser?.ability.can('read', 'Summary');
    const globalItems: NavItem[] = [];
    if (currentUser?.ability.can('read', 'Summary')) {
      globalItems.push({
        'data-cy': 'overview',
        icon: ChartBarIcon,
        id: '/overview',
        label: t('navLinks.overview')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      globalItems.push({
        'data-cy': 'view-subjects',
        icon: ChartPieIcon,
        id: '/subjects',
        label: t(`navLinks.viewSubjects`)
      });
    }
    if (currentUser?.ability.can('manage', 'Group')) {
      globalItems.push({
        'data-cy': 'manage-group',
        icon: ChartPieIcon,
        id: '/group/manage',
        label: t('navLinks.manageGroup')
      });
    }

    const sessionItems: NavItem[] = [];
    if (currentUser?.ability.can('create', 'Session')) {
      sessionItems.push({
        'data-cy': 'start-session',
        disabled: currentSession !== null,
        icon: UserPlusIcon,
        id: '/session/start-session',
        label: t('navLinks.startSession')
      });
    }
    if (currentUser?.ability.can('create', 'InstrumentRecord')) {
      sessionItems.push({
        'data-cy': 'view-instrument',
        disabled: currentSession === null,
        icon: ComputerDesktopIcon,
        id: '/instruments/available-instruments',
        label: t('navLinks.availableInstruments')
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

  return (
    <>
      <nav
        className={cn('flex w-full divide-y divide-slate-300 dark:divide-slate-700', {
          'divide-slate-700': isAlwaysDark,
          'flex-col': orientation === 'vertical',
          'justify-end': orientation === 'horizontal'
        })}
      >
        {navItems.map((items, i) => (
          <div className="w-full py-2 first:pt-0 last:pb-0" key={i}>
            <>
              {items.map(({ disabled, id, ...props }) => (
                <NavButton
                  activeClassName={btn?.activeClassName}
                  className={btn?.className}
                  disabled={disabled && location.pathname !== id}
                  isActive={location.pathname === id}
                  key={id}
                  onClick={() => {
                    navigate(id);
                    onNavigate?.(id);
                  }}
                  {...props}
                />
              ))}
              {i === navItems.length - 1 && (
                <NavButton
                  className={btn?.className}
                  disabled={currentSession === null}
                  icon={StopIcon}
                  isActive={false}
                  label={t('navLinks.endSession')}
                  onClick={() => {
                    setIsEndSessionModalOpen(true);
                  }}
                />
              )}
            </>
          </div>
        ))}
      </nav>
      <LegacyModal
        open={isEndSessionModalOpen}
        title={t('endSessionModal.title')}
        onClose={() => setIsEndSessionModalOpen(false)}
      >
        <p className="text-sm">{t('endSessionModal.message')}</p>
        <div className="mt-4 flex">
          <Button
            className="mr-2 min-w-16"
            label={t('core:yes')}
            size="sm"
            onClick={() => {
              endSession();
              setIsEndSessionModalOpen(false);
              navigate('/session/start-session');
            }}
          />
          <Button
            className="min-w-16"
            label={t('core:no')}
            size="sm"
            variant="secondary"
            onClick={() => {
              setIsEndSessionModalOpen(false);
            }}
          />
        </div>
      </LegacyModal>
    </>
  );
};
