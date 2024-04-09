import React, { useEffect } from 'react';

import { Spinner } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/instrument-renderer';
import type { UnilingualInstrumentSummary } from '@opendatacapture/schemas/instrument';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';
import { useActiveVisitStore } from '@/stores/active-visit-store';
import { useAuthStore } from '@/stores/auth-store';

export const InstrumentRenderPage = () => {
  const { activeVisit } = useActiveVisitStore();
  const { currentGroup } = useAuthStore();
  const params = useParams();
  const navigate = useNavigate();
  const notifications = useNotificationsStore();
  const location = useLocation();
  const { t } = useTranslation();

  const instrumentBundleQuery = useInstrumentBundle(params.id!);

  const locationState = location.state as { summary?: UnilingualInstrumentSummary | undefined } | undefined;
  const title = locationState?.summary?.details.title;

  useEffect(() => {
    if (!activeVisit) {
      navigate('/instruments/available-instruments');
    }
  }, [activeVisit]);

  const handleSubmit = async (data: unknown) => {
    await axios.post('/v1/instrument-records', {
      data,
      date: new Date(),
      groupId: currentGroup?.id,
      instrumentId: instrumentBundleQuery.data?.id,
      subjectId: activeVisit?.subject.id
    });
    notifications.addNotification({ type: 'success' });
  };

  if (!instrumentBundleQuery.data) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-grow flex-col">
      <PageHeader className="print:hidden" title={title ?? t('instrument')} />
      <div className="flex-grow">
        <InstrumentRenderer
          bundle={instrumentBundleQuery.data.bundle}
          subject={activeVisit?.subject}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
