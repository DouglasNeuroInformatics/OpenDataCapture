import { useEffect } from 'react';

import { Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/react-core';
import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { CreateInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';
import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router';
import axios from 'axios';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';
import { useAppStore } from '@/store';

const RouteComponent = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);

  const params = Route.useParams();
  const navigate = useNavigate();
  const notifications = useNotificationsStore();
  const location = useLocation();
  const { t } = useTranslation();

  const info = location.state.info as UnilingualInstrumentInfo;

  const instrumentBundleQuery = useInstrumentBundle(params.id);

  const title = info?.clientDetails?.title ?? info?.details.title;

  useEffect(() => {
    if (!currentSession?.id) {
      void navigate({ to: '/instruments/accessible-instruments' });
    }
  }, [currentSession?.id]);

  const handleSubmit: InstrumentSubmitHandler = async ({ data, instrumentId }) => {
    await axios.post('/v1/instrument-records', {
      data,
      date: new Date(),
      groupId: currentGroup?.id,
      instrumentId,
      sessionId: currentSession!.id,
      subjectId: currentSession!.subject!.id
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
          subject={currentSession?.subject ?? undefined}
          target={instrumentBundleQuery.data}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/instruments/render/$id')({
  component: RouteComponent
});
