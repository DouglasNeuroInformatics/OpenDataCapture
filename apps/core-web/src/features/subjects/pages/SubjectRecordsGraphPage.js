import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { RecordsGraph } from '../components/RecordsGraph';
import { VisualizationContextProvider } from '../context/VisualizationContext';
import { PageHeader } from '@/components';
export var SubjectRecordsGraphPage = function () {
  var params = useParams();
  var t = useTranslation().t;
  return React.createElement(
    VisualizationContextProvider,
    {
      instrumentOptionsFilter: function (instrument) {
        return instrument.measures;
      }
    },
    React.createElement(PageHeader, {
      title: ''.concat(t('subjectPage.pageTitle'), ': ').concat(params.subjectIdentifier.slice(0, 6))
    }),
    React.createElement(RecordsGraph, null)
  );
};
export default SubjectRecordsGraphPage;
