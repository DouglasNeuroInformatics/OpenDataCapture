import React, { useContext } from 'react';
import { Dropdown } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { VisualizationContext } from '../context/VisualizationContext';
export var TimeDropdown = function () {
  var setMinTime = useContext(VisualizationContext).setMinTime;
  var t = useTranslation().t;
  return React.createElement(Dropdown, {
    className: 'text-sm',
    options: {
      all: t('subjectPage.graph.timeframeOptions.all'),
      pastYear: t('subjectPage.graph.timeframeOptions.year'),
      pastMonth: t('subjectPage.graph.timeframeOptions.month')
    },
    title: t('subjectPage.graph.timeframe'),
    variant: 'secondary',
    onSelection: function (selection) {
      if (selection === 'pastYear') {
        setMinTime(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).getTime());
      } else if (selection === 'pastMonth') {
        setMinTime(new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime());
      } else {
        setMinTime(null);
      }
    }
  });
};
