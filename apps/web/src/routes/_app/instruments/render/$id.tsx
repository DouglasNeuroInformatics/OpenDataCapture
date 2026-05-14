import { useEffect } from 'react';

import { Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/react-core';
import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { CreateInstrumentRecordData, InstrumentRecord } from '@opendatacapture/schemas/instrument-records';
import { $FileMetadata, $PresignedUrls, $UploadCompleteData } from '@opendatacapture/schemas/storage';
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

  const handleSubmit: InstrumentSubmitHandler = async (result) => {
    const createRecordResponse = await axios.post<InstrumentRecord>('/v1/instrument-records', {
      data: result.data,
      date: currentSession!.date,
      groupId: currentGroup?.id,
      instrumentId: result.instrumentId,
      sessionId: currentSession!.id,
      subjectId: currentSession!.subject!.id
    } satisfies CreateInstrumentRecordData);
    if (result.kind !== 'FILE') {
      notifications.addNotification({ type: 'success' });
      return;
    }
    const record = createRecordResponse.data;
    const { onNext, onProgress, uploadMap } = result;

    const presignedUrlsResponse = await axios.get<$PresignedUrls>(
      `/v1/instrument-records/${record.id}/files/upload-urls`
    );

    const presignedUrls = presignedUrlsResponse.data;

    for (const basename in presignedUrls) {
      const filesToUpload = uploadMap[basename];
      if (filesToUpload?.length !== presignedUrls[basename]?.length) {
        throw new Error(
          `Files to upload (${filesToUpload?.length}) for file group with basename '${basename}' does not match presigned URLs (${presignedUrls[basename]?.length})`
        );
      }
    }

    const uploads: { [id: string]: $FileMetadata[] } = {};
    for (const basename in presignedUrls) {
      uploads[basename] = [];
      for (let i = 0; i < presignedUrls[basename]!.length; i++) {
        const file = uploadMap[basename]![i]!;
        const { location, url } = presignedUrls[basename]![i]!;
        await axios.put(url, file, {
          headers: {
            'Content-Type': file.type
          },
          meta: {
            disableDefaultAuth: true,
            disableDefaultTimeout: true
          },
          onUploadProgress: (event) => {
            onProgress(file, event);
          }
        });
        uploads[basename].push({ location, name: file.name, size: file.size });
        onNext();
      }
    }

    await axios.post(`/v1/instrument-records/${record.id}/files/upload-complete`, {
      uploads
    } satisfies $UploadCompleteData);
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
