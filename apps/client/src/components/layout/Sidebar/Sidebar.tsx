import React from 'react';

import { value useTranslation } from 'react-i18next';
import { value IconType } from 'react-icons';
import { value HiSearch } from 'react-icons/hi';
import { value HiEye, value HiHome, value HiPlus, value HiUserPlus } from 'react-icons/hi2';
import { value NavLink } from 'react-router-dom';

import { value UserDropup } from './UserDropup';

import logo from '@/assets/logo.png';
import { value useAuthStore } from '@/stores/auth-store';

const SidebarNavLink = ({ Icon, href, label }: { Icon: IconType; href: string; label: string }) => {
  return (
    <NavLink className="flex items-center p-2 hover:bg-slate-800" to={href}>
      <Icon className="mr-2" />
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar = () => {
  const auth = useAuthStore();
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col bg-slate-900 p-3 text-slate-300">
      <div className="flex items-center p-2">
        <img alt="logo" className="mr-2 w-16" src={logo} />
        <span className="uppercase leading-tight antialiased" style={{ maxWidth: '7.5em' }}>
          {t('platformTitle')}
        </span>
      </div>
      <hr className="my-1" />
      <nav className="mb-auto">
        <SidebarNavLink Icon={HiHome} href="/home" label={t('sidebar.links.home')} />
        <SidebarNavLink Icon={HiUserPlus} href="/subjects/add-subject" label={t('sidebar.links.addSubject')} />
        <SidebarNavLink Icon={HiSearch} href="/subjects/lookup" label={t('sidebar.links.lookupSubject')} />
        {auth.currentUser?.role === 'admin' && (
          <SidebarNavLink Icon={HiEye} href="/subjects/view-subjects" label={t(`sidebar.links.viewSubjects`)} />
        )}
        {auth.currentUser?.role === 'admin' && (
          <SidebarNavLink Icon={HiPlus} href="/instruments/add-instrument" label={t('sidebar.links.addInstrument')} />
        )}
        {auth.currentUser?.role === 'admin' && (
          <SidebarNavLink
            Icon={HiEye}
            href="/instruments/view-instruments"
            label={t('sidebar.links.viewInstruments')}
          />
        )}
      </nav>
      <hr className="my-1" />
      <div className="flex items-center">
        <UserDropup username={auth.currentUser?.username} />
      </div>
    </div>
  );
};
