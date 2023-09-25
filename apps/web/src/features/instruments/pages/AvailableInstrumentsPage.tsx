import type { FormInstrumentSummary } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { InstrumentShowcase } from '../components/InstrumentShowcase';

import { PageHeader } from '@/components';
import { showSpinner } from '@/features/misc/components/LoadingFallback';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  const { data } = useFetch<FormInstrumentSummary[]>('/v1/instruments/forms/available');
  const { t } = useTranslation();
  
  if (!data) {
    setTimeout(showSpinner, 100);
    
  }
  else{

    return (
      <div>
        <PageHeader title={t('instruments.availableInstruments.pageTitle')} />
        <InstrumentShowcase instruments={data} />
      </div>
    );
  }

};

export default AvailableInstrumentsPage;
