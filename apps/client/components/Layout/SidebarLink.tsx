import React from 'react';

import Link from 'next/link';

import { useTranslation } from 'next-i18next';

interface SidebarLinkProps {
  HeroIcon: React.FC<React.ComponentProps<'svg'>>;
  href: string;
}

const SidebarLink = ({ HeroIcon, href }: SidebarLinkProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebarLinks' });
  return (
    <Link className="nav-link d-flex align-items-center text-light" href={href}>
      <HeroIcon className="me-2" height="24" />
      <span>{t(href)}</span>
    </Link>
  );
};

export default SidebarLink;
