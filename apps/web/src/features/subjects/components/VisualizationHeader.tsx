import { useContext } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/utils';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

export const VisualizationHeader = () => {
  const ctx = useContext(VisualizationContext);
  const { t } = useTranslation();
  return (
    <div className="mb-5">
      <h3 className="text-lg font-semibold">
        {t('subjectPage.visualization.selectedInstrument', {
          title: ctx.selectedInstrument?.details.title ?? t('subjectPage.visualization.selectedInstrumentNone')
        })}
      </h3>
      {ctx.minTime && (
        <p className="text-center">
          {toBasicISOString(new Date(ctx.minTime))} - {toBasicISOString(new Date())}
        </p>
      )}
    </div>
  );
};
