import React from 'react';

import { AdjustmentsHorizontalIcon, ChartBarIcon, EyeIcon, PlusIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

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
        icon={<ChartBarIcon />}
        label={t('navLinks.overview')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'Subject' }}
        cyTestId="add-visit"
        href="/visits/add-visit"
        icon={<UserPlusIcon />}
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
        href="/subjects"
        icon={<EyeIcon />}
        label={t(`navLinks.viewSubjects`)}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'Instrument' }}
        cyTestId="create-instrument"
        href="/instruments/create-instrument"
        icon={<PlusIcon />}
        label={t('navLinks.createInstrument')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'delete', subject: 'Instrument' }}
        cyTestId="manage-instrument"
        href="/instruments/manage-instruments"
        icon={<AdjustmentsHorizontalIcon />}
        label={t('navLinks.manageInstruments')}
        {...props}
      />
      <NavigationLink
        access={{ action: 'create', subject: 'InstrumentRecord' }}
        cyTestId="view-instrument"
        href="/instruments/available-instruments"
        icon={<EyeIcon />}
        label={t('navLinks.availableInstruments')}
        {...props}
      />
    </nav>
  );
};
