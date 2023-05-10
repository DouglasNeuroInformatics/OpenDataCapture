import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { Dropdown } from '@/components';

export const TimeDropdown = () => {
  const { setMinTime } = useContext(VisualizationContext);
  const { t } = useTranslation('subjects');

  return (
    <Dropdown
      className="text-sm"
      options={{
        all: t('subjectPage.graph.timeframeOptions.all'),
        pastYear: t('subjectPage.graph.timeframeOptions.year'),
        pastMonth: t('subjectPage.graph.timeframeOptions.month')
      }}
      title={t('subjectPage.graph.timeframe')}
      variant="light"
      onSelection={(selection) => {
        if (selection === 'pastYear') {
          setMinTime(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).getTime());
        } else if (selection === 'pastMonth') {
          setMinTime(new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime());
        } else {
          setMinTime(null);
        }
      }}
    />
  );
};
