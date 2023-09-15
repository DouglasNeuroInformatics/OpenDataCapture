import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components';
export var ManageInstrumentsPage = function () {
  var t = useTranslation().t;
  return React.createElement(
    'div',
    null,
    React.createElement(PageHeader, { title: t('instruments.manageInstruments.pageTitle') })
  );
};
export default ManageInstrumentsPage;
