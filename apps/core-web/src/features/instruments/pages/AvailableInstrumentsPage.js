import React from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentShowcase } from '../components/InstrumentShowcase';
import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
export var AvailableInstrumentsPage = function () {
  var data = useFetch('/v1/instruments/forms/available').data;
  var t = useTranslation().t;
  if (!data) {
    return React.createElement(Spinner, null);
  }
  return React.createElement(
    'div',
    null,
    React.createElement(PageHeader, { title: t('instruments.availableInstruments.pageTitle') }),
    React.createElement(InstrumentShowcase, { instruments: data })
  );
};
export default AvailableInstrumentsPage;
