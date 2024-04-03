import React from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useTranslation } from 'react-i18next';

export type VisualizationHeaderProps = {
  minDate?: Date | null;
  title?: string;
};

export const VisualizationHeader = ({ minDate, title }: VisualizationHeaderProps) => {
  const { t } = useTranslation('subjects');
  return (
    <div className="mb-5" style={{ paddingTop: 5 }}>
      <h3 className="text-lg font-semibold">
        {t('visualization.selectedInstrument', {
          title: title ?? t('visualization.selectedInstrumentNone')
        })}
      </h3>
      {minDate && (
        <p className="text-sm font-medium">
          {toBasicISOString(minDate)} - {toBasicISOString(new Date())}
        </p>
      )}
    </div>
  );
};
