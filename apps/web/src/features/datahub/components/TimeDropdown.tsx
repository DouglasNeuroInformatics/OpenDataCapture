import React from 'react';

import { ActionDropdown } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

export type TimeDropdownProps = {
  setMinTime: (value: Date | null) => void;
};

export const TimeDropdown = ({ setMinTime }: TimeDropdownProps) => {
  const { t } = useTranslation('datahub');

  return (
    <ActionDropdown
      options={{
        all: t('visualization.timeframeOptions.all'),
        pastMonth: t('visualization.timeframeOptions.month'),
        pastYear: t('visualization.timeframeOptions.year')
      }}
      title={t('visualization.timeframe')}
      onSelection={(selection) => {
        if (selection === 'pastYear') {
          setMinTime(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
        } else if (selection === 'pastMonth') {
          setMinTime(new Date(new Date().setMonth(new Date().getMonth() - 1)));
        } else {
          setMinTime(null);
        }
      }}
    />
  );
};
