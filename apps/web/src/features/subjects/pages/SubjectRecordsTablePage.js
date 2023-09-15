import React from 'react';
import { RecordsTable } from '../components/RecordsTable';
import { VisualizationContextProvider } from '../context/VisualizationContext';
import { useSubjectPageTitle } from '../hooks/useSubjectPageTitle';
import { PageHeader } from '@/components';
export var SubjectRecordsTablePage = function () {
  var title = useSubjectPageTitle();
  return React.createElement(
    VisualizationContextProvider,
    null,
    React.createElement(PageHeader, { title: title }),
    React.createElement(RecordsTable, null)
  );
};
export default SubjectRecordsTablePage;
