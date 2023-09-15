import React, { useContext } from 'react';
import { SelectDropdown } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { VisualizationContext } from '../context/VisualizationContext';
export var MeasuresDropdown = function () {
  var _a = useContext(VisualizationContext),
    measureOptions = _a.measureOptions,
    selectedMeasures = _a.selectedMeasures,
    setSelectedMeasures = _a.setSelectedMeasures;
  var t = useTranslation().t;
  return React.createElement(SelectDropdown, {
    checkPosition: 'right',
    className: 'text-sm',
    options: measureOptions,
    selected: selectedMeasures,
    setSelected: setSelectedMeasures,
    title: t('subjectPage.graph.measures'),
    variant: 'secondary'
  });
};
