import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { Dropdown } from '@/components';

export const InstrumentDropdown = () => {
  const { t } = useTranslation('subjects');
  const ctx = useContext(VisualizationContext);

  return (
    <Dropdown
      className="text-sm"
      options={ctx.instrumentOptions}
      title={t('subjectPage.graph.instrument')}
      variant="light"
      onSelection={(selection) => {
        ctx.setSelectedMeasures([]);
        ctx.setSelectedInstrument(
          ctx.data.find(({ instrument }) => instrument.identifier === selection)?.instrument ?? null
        );
      }}
    />
  );
};
