import React from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

export type VisualizationHeaderProps = {
  minDate?: Date | null;
  title?: string;
};

export const VisualizationHeader = ({ minDate, title }: VisualizationHeaderProps) => {
  const { t } = useTranslation('datahub');
  return (
    <div className="mb-5" style={{ paddingTop: 5 }}>
      <Heading variant="h4">
        {t('visualization.selectedInstrument', {
          title: title ?? t('visualization.selectedInstrumentNone')
        })}
      </Heading>
      {minDate && (
        <p className="text-sm font-medium">
          {toBasicISOString(minDate)} - {toBasicISOString(new Date())}
        </p>
      )}
    </div>
  );
};
