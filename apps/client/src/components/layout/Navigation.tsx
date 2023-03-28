import React from 'react';

import { useTranslation } from 'react-i18next';
import { HiChartBar, HiEye, HiPlus, HiUserPlus } from 'react-icons/hi2';

import { NavigationLink } from './NavigationLink';

export interface NavigationProps {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Navigation = (props: NavigationProps) => {
  const { t } = useTranslation();
  return (
    <nav>
      <NavigationLink href="/overview" icon={<HiChartBar />} label={t('sidebar.links.overview')} {...props} />
      <NavigationLink
        href="/subjects/add-subject"
        icon={<HiUserPlus />}
        label={t('sidebar.links.addSubject')}
        {...props}
      />
      <NavigationLink
        href="/subjects/view-subjects"
        icon={<HiEye />}
        label={t(`sidebar.links.viewSubjects`)}
        {...props}
      />
      <NavigationLink href="/instruments/create" icon={<HiPlus />} label={t('sidebar.links.create')} {...props} />
      <NavigationLink href="/instruments/forms" icon={<HiEye />} label={t('sidebar.links.forms')} {...props} />
    </nav>
  );
};
