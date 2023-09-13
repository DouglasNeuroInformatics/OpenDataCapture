import React from 'react';
import { useTranslation } from 'react-i18next';
import { RxBarChart, RxTable } from 'react-icons/rx';
import { VisualizationMode } from '../components/VisualizationMode';
import { PageHeader } from '@/components';
export var SelectVisualizationPage = function () {
  var t = useTranslation().t;
  return React.createElement(
    'div',
    null,
    React.createElement(PageHeader, { title: t('visualization.selectMode') }),
    React.createElement(
      'div',
      { className: 'my-16 flex items-center justify-center gap-8' },
      React.createElement(VisualizationMode, {
        icon: React.createElement(RxTable, null),
        title: t('table'),
        to: 'table'
      }),
      React.createElement(VisualizationMode, {
        icon: React.createElement(RxBarChart, null),
        title: t('graph'),
        to: 'graph'
      })
    )
  );
};
export default SelectVisualizationPage;
