import React from 'react';
import { useTranslation } from 'react-i18next';
import { SubjectsTable } from '../components/SubjectsTable';
import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
export var ViewSubjectsPage = function () {
  var data = useFetch('/v1/subjects').data;
  var t = useTranslation().t;
  if (!data) {
    return React.createElement(Spinner, null);
  }
  return React.createElement(
    'div',
    null,
    React.createElement(PageHeader, { title: t('viewSubjects.pageTitle') }),
    React.createElement(SubjectsTable, { data: data })
  );
};
export default ViewSubjectsPage;
