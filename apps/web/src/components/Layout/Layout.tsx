import { useEffect, useState } from 'react';

import { AdjustmentsHorizontalIcon, ChartBarIcon, EyeIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { type NavItem, Navbar } from '@open-data-capture/react-core';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const { currentUser } = useAuthStore();
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
    if (currentUser?.ability.can('create', 'Visit')) {
      globalItems.push({
        'data-cy': 'add-visit',
        icon: UserPlusIcon,
        id: '/visits/add-visit',
        label: t('navLinks.addVisit')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      globalItems.push({
        'data-cy': 'view-subjects',
        icon: EyeIcon,
        id: '/subjects',
        label: t(`navLinks.viewSubjects`)
      });
    }
    if (currentUser?.ability.can('manage', 'Instrument')) {
      globalItems.push({
        'data-cy': 'manage-instrument',
        icon: AdjustmentsHorizontalIcon,
        id: '/instruments/manage-instruments',
        label: t('navLinks.manageInstruments')
      });
    }
    if (currentUser?.ability.can('create', 'InstrumentRecord')) {
      globalItems.push({
        'data-cy': 'view-instrument',
        icon: EyeIcon,
        id: '/instruments/available-instruments',
        label: t('navLinks.availableInstruments')
      });
    }
    setNavItems([globalItems]);
  }, [currentUser, i18n.resolvedLanguage]);

  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      <div className="md:hidden print:hidden">
        <Navbar activeItemId={location.pathname} i18n={i18n} items={navItems} onNavigate={navigate} />
      </div>
      <div className="hidden md:flex md:flex-shrink-0 print:hidden">
        <Sidebar activeItemId={location.pathname} items={navItems} onNavigate={navigate} />
      </div>
      <div className="scrollbar-none flex flex-grow flex-col overflow-y-scroll pt-16 md:pt-0">
        <main className="container flex flex-grow flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
