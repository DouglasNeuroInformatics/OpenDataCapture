import React, { useEffect } from 'react';

import { Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/instrument-renderer';
import type { Json } from '@opendatacapture/schemas/core';
import type { UnilingualInstrumentSummary } from '@opendatacapture/schemas/instrument';
import type { CreateInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';
import { useAppStore } from '@/store';

export const InstrumentRenderPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);

  const params = useParams();
  const navigate = useNavigate();
  const notifications = useNotificationsStore();
  const location = useLocation();
  const { t } = useTranslation();

  const instrumentBundleQuery = useInstrumentBundle(params.id!);

  const locationState = location.state as { summary?: UnilingualInstrumentSummary | undefined } | undefined;
  const title = locationState?.summary?.details.title;

  useEffect(() => {
    if (!currentSession?.id) {
      navigate('/instruments/accessible-instruments');
    }
  }, [currentSession?.id]);

  const handleSubmit = async (data: Json) => {
    await axios.post('/v1/instrument-records', {
      data,
      date: new Date(),
      groupId: currentGroup?.id,
      instrumentId: instrumentBundleQuery.data!.id,
      sessionId: currentSession!.id,
      subjectId: currentSession!.subject.id
    } satisfies CreateInstrumentRecordData);
    notifications.addNotification({ type: 'success' });
  };

  if (!instrumentBundleQuery.data) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-grow flex-col">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {title ?? t('instrument')}
        </Heading>
      </PageHeader>
      <div className="flex-grow">
        <InstrumentRenderer
          bundle={instrumentBundleQuery.data.bundle}
          subject={currentSession?.subject}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
