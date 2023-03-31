import React from 'react';

import { useTranslation } from 'react-i18next';
import { HiChartBar, HiEye, HiPlus, HiUserPlus } from 'react-icons/hi2';

import { NavigationLink } from './NavigationLink';

export interface NavigationProps {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Navigation = (props: NavigationProps) => {
  const { t } = useTranslation('common');

  return (
    <nav>
      <NavigationLink href="/overview" icon={<HiChartBar />} label={t('navLinks.overview')} {...props} />
      <NavigationLink href="/subjects/add-subject" icon={<HiUserPlus />} label={t('navLinks.addSubject')} {...props} />
      <NavigationLink href="/subjects/view-subjects" icon={<HiEye />} label={t(`navLinks.viewSubjects`)} {...props} />
      <NavigationLink href="/instruments/create" icon={<HiPlus />} label={t('navLinks.createInstrument')} {...props} />
      <NavigationLink
        href="/instruments/available"
        icon={<HiEye />}
        label={t('navLinks.availableInstruments')}
        {...props}
      />
    </nav>
  );
};
