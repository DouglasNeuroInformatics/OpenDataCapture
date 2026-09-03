import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { BulkRemoteAssignmentWizard } from '@/components/BulkRemoteAssignmentWizard';
import { PageHeader } from '@/components/PageHeader';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useSubjectsQuery } from '@/hooks/useSubjectsQuery';
import { useAppStore } from '@/store';
import { getDefaultAssignmentExpiry } from '@/utils/assignment-duration';

const RouteComponent = () => {
  const { t } = useTranslation();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const setupStateQuery = useSetupStateQuery();
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const subjectsQuery = useSubjectsQuery({ params: { groupId: currentGroup?.id } });

  if (!currentGroup) {
    return null;
  }

  // Only what this group has opted into may be assigned; the API enforces the same list, so an
  // instrument missing here would be refused there anyway.
  const instruments = (instrumentInfoQuery.data ?? [])
    .filter((instrument) => currentGroup.accessibleInstrumentIds.includes(instrument.id))
    .map((instrument) => ({ id: instrument.id, title: instrument.details.title }));

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Bulk Remote Assignments', fr: 'Tâches à distance en lot' })}
        </Heading>
      </PageHeader>
      <BulkRemoteAssignmentWizard
        defaultExpiresAt={
          getDefaultAssignmentExpiry(setupStateQuery.data.defaultAssignmentDurationDays).toISOString().split('T')[0]!
        }
        groupId={currentGroup.id}
        instruments={instruments}
        subjectIdDisplayLength={currentGroup.settings.subjectIdDisplayLength ?? 9}
        subjects={subjectsQuery.data}
      />
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/group/bulk-remote-assignments')({
  component: RouteComponent
});
