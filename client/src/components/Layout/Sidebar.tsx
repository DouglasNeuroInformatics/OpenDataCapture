import React from 'react';

import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import { HiEye, HiHome, HiPlus, HiUserPlus } from 'react-icons/hi2';
import { NavLink } from 'react-router-dom';

import UserDropup from './UserDropup';

import logo from '@/assets/logo.png';
import useAuth from '@/hooks/useAuth';

const SidebarNavLink = ({ Icon, href }: { Icon: IconType; href: string }) => {
  const { t } = useTranslation();
  return (
    <NavLink className="flex items-center p-2 hover:bg-slate-800" to={href}>
      <Icon className="mr-2" />
      <span>{t(`sidebar.links.${href}`)}</span>
    </NavLink>
  );
};

const Sidebar = () => {
  const auth = useAuth();
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
        <SidebarNavLink Icon={HiHome} href="/home" />
        <SidebarNavLink Icon={HiUserPlus} href="/subjects/add-subject" />
        {auth.currentUser?.role === 'admin' && <SidebarNavLink Icon={HiEye} href="/subjects/view-subjects" />}
        {auth.currentUser?.role === 'admin' && <SidebarNavLink Icon={HiPlus} href="/instruments/add-instrument" />}
        {auth.currentUser?.role === 'admin' && <SidebarNavLink Icon={HiEye} href="/instruments/view-instruments" />}
      </nav>
      <hr className="my-1" />
      <div className="flex items-center">
        <UserDropup username={auth.currentUser?.username} />
      </div>
    </div>
  );
};

export default Sidebar;
