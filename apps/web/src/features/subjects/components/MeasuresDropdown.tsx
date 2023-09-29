import { useContext } from 'react';

import { SelectDropdown } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

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
      title={t('subjectPage.visualization.measures')}
      variant="secondary"
    />
  );
};
