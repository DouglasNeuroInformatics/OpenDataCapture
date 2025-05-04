import { useEffect } from 'react';

import { Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/react-core';
import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { CreateInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Location } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';
import { useAppStore } from '@/store';

export const InstrumentRenderPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);

  const params = useParams();
  const navigate = useNavigate();
  const notifications = useNotificationsStore();
  const location = useLocation() as Location<{ info?: UnilingualInstrumentInfo }>;
  const { t } = useTranslation();

  const instrumentBundleQuery = useInstrumentBundle(params.id!);

  const title = location.state?.info?.clientDetails?.title ?? location.state.info?.details.title;

  useEffect(() => {
    if (!currentSession?.id) {
      navigate('/instruments/accessible-instruments');
    }
  }, [currentSession?.id]);

  const handleSubmit: InstrumentSubmitHandler = async ({ data, instrumentId }) => {
    await axios.post('/v1/instrument-records', {
      data,
      date: new Date(),
      groupId: currentGroup?.id,
      instrumentId,
      sessionId: currentSession!.id,
      subjectId: currentSession!.subject.id
    } satisfies CreateInstrumentRecordData);
    notifications.addNotification({ type: 'success' });
  };

  if (!instrumentBundleQuery.data) {
    return <Spinner />;
  }

  return (
    <div className="flex grow flex-col">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {title ?? t('core.instrument')}
        </Heading>
      </PageHeader>
      <div className="grow">
        <InstrumentRenderer
          className="mx-auto max-w-3xl"
          subject={currentSession?.subject}
          target={instrumentBundleQuery.data}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
