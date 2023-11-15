import { useEffect, useState } from 'react';

import { AdjustmentsHorizontalIcon, ChartBarIcon, EyeIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { type NavItem, Navbar } from '@open-data-capture/react-core/components';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const { currentUser } = useAuthStore();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const { i18n, t } = useTranslation('layout');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const items: NavItem[] = [
      {
        'data-cy': 'overview',
        icon: ChartBarIcon,
        id: '/overview',
        label: t('navLinks.overview')
      }
    ];
    if (currentUser?.ability.can('create', 'Visit')) {
      items.push({
        'data-cy': 'add-visit',
        icon: UserPlusIcon,
        id: '/visits/add-visit',
        label: t('navLinks.addVisit')
      });
    }
    if (currentUser?.ability.can('read', 'Subject') && currentUser.ability.can('read', 'InstrumentRecord')) {
      items.push({
        'data-cy': 'view-subjects',
        icon: EyeIcon,
        id: '/subjects',
        label: t(`navLinks.viewSubjects`)
      });
    }
    if (currentUser?.ability.can('manage', 'Instrument')) {
      items.push({
        'data-cy': 'manage-instrument',
        icon: AdjustmentsHorizontalIcon,
        id: '/instruments/manage-instruments',
        label: t('navLinks.manageInstruments')
      });
    }
    if (currentUser?.ability.can('create', 'InstrumentRecord')) {
      items.push({
        'data-cy': 'view-instrument',
        icon: EyeIcon,
        id: '/instruments/available-instruments',
        label: t('navLinks.availableInstruments')
      });
    }
    setNavItems(items);
  }, [currentUser, i18n.resolvedLanguage]);

  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      <div className="print:hidden md:hidden">
        <Navbar activeItemId={location.pathname} i18n={i18n} items={navItems} onNavigate={navigate} />
      </div>
      <div className="hidden print:hidden md:flex md:flex-shrink-0">
        <Sidebar activeItemId={location.pathname} items={navItems} onNavigate={navigate} />
      </div>
      <div className="scrollbar-none flex flex-grow flex-col overflow-y-scroll">
        <main className="container flex flex-grow flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
