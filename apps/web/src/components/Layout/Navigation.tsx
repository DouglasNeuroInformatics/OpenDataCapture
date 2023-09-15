import React from 'react';

import { useTranslation } from 'react-i18next';
import { HiAdjustmentsHorizontal, HiChartBar, HiEye, HiPlus, HiUserPlus } from 'react-icons/hi2';

import { NavigationLink } from './NavigationLink';

export type NavigationProps = {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const Navigation = (props: NavigationProps) => {
  const { t } = useTranslation();

  return (
    <nav>
      <NavigationLink access={null} href="/overview" icon={<HiChartBar />} label={t('navLinks.overview')} {...props} />
      <NavigationLink
        access={{ action: 'create', subject: 'Subject' }}
        href="/subjects/add-visit"
        icon={<HiUserPlus />}
        label={t('navLinks.addVisit')}
        {...props}
      />
      <NavigationLink
        access={[
          {
            action: 'read',
            subject: 'Subject'
          },
          {
            action: 'read',
            subject: 'InstrumentRecord'
          }
        ]}
        href="/subjects/view-subjects"
        icon={<HiEye />}
        label={t(`navLinks.viewSubjects`)}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'Instrument' }}
        href="/instruments/create"
        icon={<HiPlus />}
        label={t('navLinks.createInstrument')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'delete', subject: 'Instrument' }}
        href="instruments/manage"
        icon={<HiAdjustmentsHorizontal />}
        label={t('navLinks.manageInstruments')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'InstrumentRecord' }}
        href="/instruments/available"
        icon={<HiEye />}
        label={t('navLinks.availableInstruments')}
        {...props}
      />
    </nav>
  );
};
