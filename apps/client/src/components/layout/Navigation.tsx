import React from 'react';

import { useTranslation } from 'react-i18next';
import { HiChartBar, HiEye, HiPlus, HiUserPlus } from 'react-icons/hi2';
import { NavLink } from 'react-router-dom';

const NavigationLink = ({ href, label, icon }: { href: string; label: string; icon: React.ReactElement }) => {
  return (
    <NavLink className="flex items-center p-2 hover:bg-slate-800" to={href}>
      {icon}
      <span className="ml-2">{label}</span>
    </NavLink>
  );
};

export const Navigation = () => {
  const { t } = useTranslation();
  return (
    <nav>
      <NavigationLink href="/overview" icon={<HiChartBar />} label={t('sidebar.links.overview')} />
      <NavigationLink href="/subjects/add-subject" icon={<HiUserPlus />} label={t('sidebar.links.addSubject')} />
      <NavigationLink href="/subjects/view-subjects" icon={<HiEye />} label={t(`sidebar.links.viewSubjects`)} />
      <NavigationLink href="/instruments/add-instrument" icon={<HiPlus />} label={t('sidebar.links.addInstrument')} />
      <NavigationLink
        href="/instruments/view-instruments"
        icon={<HiEye />}
        label={t('sidebar.links.viewInstruments')}
      />
    </nav>
  );
};
