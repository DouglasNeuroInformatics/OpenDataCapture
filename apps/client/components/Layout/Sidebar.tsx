import React from 'react';

import Image from 'next/image';

import { HomeIcon, UserPlusIcon, EyeIcon, XMarkIcon, PlusIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';

import SidebarLink from './SidebarLink';
import UserDropdown from './UserDropdown';

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ collapsed, onClose }: SidebarProps) => {
  const { t } = useTranslation('common');
  return (
    <div
      className={classNames('sidebar d-flex flex-column vh-100 p-3 bg-dark text-light overflow-scroll', {
        'sidebar-collapsed': collapsed
      })}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Image
            alt="logo"
            className="img-fluid me-2"
            height={60}
            src={process.env['NEXT_PUBLIC_LOGO_PATH'] as string}
            width={60}
          />
          <div className="d-flex flex-column lh-sm text-uppercase">
            <span>{t('platformTitle')}</span>
          </div>
        </div>
        <button className="btn btn-link text-light d-md-none" type="button" onClick={onClose}>
          <XMarkIcon height="24" width="24" />
        </button>
      </div>
      <hr />
      <nav className="nav nav-pills flex-column mb-auto">
        <SidebarLink HeroIcon={HomeIcon} href="/" />
        <SidebarLink HeroIcon={UserPlusIcon} href="/add-subject" />
        <SidebarLink HeroIcon={EyeIcon} href="/view-subjects" />
        <SidebarLink HeroIcon={PlusIcon} href="/add-instrument" />
        <SidebarLink HeroIcon={FaceSmileIcon} href="/happiness-scale" />
      </nav>
      <hr />
      <UserDropdown />
    </div>
  );
};

export default Sidebar;
