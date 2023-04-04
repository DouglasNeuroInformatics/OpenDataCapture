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
      <NavigationLink access={null} href="/overview" icon={<HiChartBar />} label={t('navLinks.overview')} {...props} />
      <NavigationLink
        access={['create', 'Subject']}
        href="/subjects/add-subject"
        icon={<HiUserPlus />}
        label={t('navLinks.addSubject')}
        {...props}
      />
      <NavigationLink
        access={['read', 'Subject']}
        href="/subjects/view-subjects"
        icon={<HiEye />}
        label={t(`navLinks.viewSubjects`)}
        {...props}
      />
      <NavigationLink
        access={['create', 'Instrument']}
        href="/instruments/create"
        icon={<HiPlus />}
        label={t('navLinks.createInstrument')}
        {...props}
      />
      <NavigationLink
        access={['create', 'InstrumentRecord']}
        href="/instruments/available"
        icon={<HiEye />}
        label={t('navLinks.availableInstruments')}
        {...props}
      />
    </nav>
  );
};
