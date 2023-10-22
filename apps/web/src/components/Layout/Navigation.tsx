import React from 'react';

import { useTranslation } from 'react-i18next';
import { HiAdjustmentsHorizontal, HiChartBar, HiEye, HiPlus, HiUserPlus } from 'react-icons/hi2';

import { NavigationLink } from './NavigationLink';

export type NavigationProps = {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const Navigation = (props: NavigationProps) => {
  const { t } = useTranslation('layout');

  return (
    <nav className="flex-grow">
      <NavigationLink
        access={null}
        cyTestId="overview"
        href="/overview"
        icon={<HiChartBar />}
        label={t('navLinks.overview')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'Subject' }}
        cyTestId="add-visit"
        href="/visits/add-visit"
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
        cyTestId="view-subjects"
        href="/subjects/view-subjects"
        icon={<HiEye />}
        label={t(`navLinks.viewSubjects`)}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'Instrument' }}
        cyTestId="create-instrument"
        href="/instruments/create"
        icon={<HiPlus />}
        label={t('navLinks.createInstrument')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'delete', subject: 'Instrument' }}
        cyTestId="manage-instrument"
        href="instruments/manage"
        icon={<HiAdjustmentsHorizontal />}
        label={t('navLinks.manageInstruments')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'InstrumentRecord' }}
        cyTestId="view-instrument"
        href="/instruments/available"
        icon={<HiEye />}
        label={t('navLinks.availableInstruments')}
        {...props}
      />
    </nav>
  );
};
