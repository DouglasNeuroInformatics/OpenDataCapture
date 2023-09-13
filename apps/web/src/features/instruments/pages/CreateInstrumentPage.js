import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormCreator } from '../components/FormCreator';
import { PageHeader } from '@/components';
export var CreateInstrumentPage = function () {
  var t = useTranslation().t;
  return React.createElement(
    'div',
    null,
    React.createElement(PageHeader, { title: t('instruments.createInstrument.pageTitle') }),
    React.createElement(FormCreator, null)
  );
};
export default CreateInstrumentPage;
