import { useEffect } from 'react';

import { Spinner, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { InstrumentRenderer } from '@open-data-capture/instrument-renderer';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

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

  const instrumentBundleQuery = useInstrumentBundle(params.id!);

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
      <PageHeader className="print:hidden" title={'TITLE'} />
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
