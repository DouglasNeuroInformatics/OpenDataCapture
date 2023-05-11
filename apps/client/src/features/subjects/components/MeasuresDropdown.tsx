import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { SelectDropdown } from '@/components';

export const MeasuresDropdown = () => {
  const { measureOptions, selectedMeasures, setSelectedMeasures } = useContext(VisualizationContext);
  const { t } = useTranslation();
  return (
    <SelectDropdown
      checkPosition="right"
      className="text-sm"
      options={measureOptions}
      selected={selectedMeasures}
      setSelected={setSelectedMeasures}
      title={t('subjectPage.graph.measures')}
      variant="light"
    />
  );
};
