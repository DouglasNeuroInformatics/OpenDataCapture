import React, { useContext } from 'react';

import { DateUtils } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

export const VisualizationHeader = () => {
  const ctx = useContext(VisualizationContext);
  const { t } = useTranslation();
  return (
    <div className="mb-5">
      <h3 className="text-center text-xl font-medium">
        {ctx.selectedInstrument?.details.title ?? t('subjectPage.graph.defaultTitle')}
      </h3>
      {ctx.minTime && (
        <p className="text-center">
          {DateUtils.toBasicISOString(new Date(ctx.minTime))} - {DateUtils.toBasicISOString(new Date())}
        </p>
      )}
    </div>
  );
};
