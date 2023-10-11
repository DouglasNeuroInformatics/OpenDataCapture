import { useContext } from 'react';

import { Dropdown } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

export const InstrumentDropdown = () => {
  const { t } = useTranslation();
  const ctx = useContext(VisualizationContext);

  return (
    <Dropdown
      className="text-sm"
      options={ctx.instrumentOptions}
      title={t('subjectPage.visualization.instrument')}
      variant="secondary"
      onSelection={(selection) => {
        ctx.setSelectedMeasures([]);
        ctx.setSelectedInstrument(
          ctx.data.find(({ instrument }) => instrument.identifier === selection)?.instrument ?? null
        );
      }}
    />
  );
};
