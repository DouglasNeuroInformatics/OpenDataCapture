import { useContext } from 'react';

import { Dropdown } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

export const TimeDropdown = () => {
  const { setMinTime } = useContext(VisualizationContext);
  const { t } = useTranslation();

  return (
    <Dropdown
      className="text-sm"
      options={{
        all: t('subjectPage.visualization.timeframeOptions.all'),
        pastMonth: t('subjectPage.visualization.timeframeOptions.month'),
        pastYear: t('subjectPage.visualization.timeframeOptions.year')
      }}
      title={t('subjectPage.visualization.timeframe')}
      variant="secondary"
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
