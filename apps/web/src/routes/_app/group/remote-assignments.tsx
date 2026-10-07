import React, { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Card, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { PlusIcon, SendIcon, Trash2Icon } from 'lucide-react';

import { BulkRemoteAssignmentWizard } from '@/components/BulkRemoteAssignmentWizard';
import { DeleteRemoteAssignments } from '@/components/DeleteRemoteAssignments';
import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { setupStateQueryOptions, useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { subjectsQueryOptions, useSubjectsQuery } from '@/hooks/useSubjectsQuery';
import { useAppStore } from '@/store';
import { selectAdministrableInstruments } from '@/utils/administrable-instruments';
import { getDefaultAssignmentExpiry } from '@/utils/assignment-duration';

type Mode = 'CREATE' | 'DELETE' | 'LANDING';

type ActionCardProps = {
  icon: React.ReactNode;
  onClick: () => void;
  testId: string;
  title: string;
};

const ActionCard = ({ icon, onClick, testId, title }: ActionCardProps) => (
  <Card
    className="hover:border-primary/40 flex cursor-pointer flex-col items-center gap-4 p-8 transition-colors"
    data-testid={testId}
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
  >
    {icon}
    <Card.Title className="text-xl">{title}</Card.Title>
  </Card>
);

const CompositeIcon = ({ Badge }: { Badge: React.FC<{ className?: string }> }) => (
  <div className="flex items-center gap-1">
    <SendIcon className="text-primary h-48 w-48" />
    <Badge className="text-foreground h-20 w-20" />
  </div>
);

const searchModeToMode = (searchMode: string | undefined): Mode => {
  if (searchMode === 'create') return 'CREATE';
  if (searchMode === 'delete') return 'DELETE';
  return 'LANDING';
};

const RouteComponent = () => {
  const { t } = useTranslation();
  const { mode: searchMode } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(searchModeToMode(searchMode));
  const currentGroup = useAppStore((store) => store.currentGroup);
  const setupStateQuery = useSetupStateQuery();
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const subjectsQuery = useSubjectsQuery({ params: { groupId: currentGroup?.id } });

  useEffect(() => {
    setMode(searchModeToMode(searchMode));
  }, [searchMode]);

  if (!currentGroup) {
    return null;
  }

  // The API enforces the same rule, so an instrument missing here would be refused there anyway.
  const instruments = selectAdministrableInstruments(instrumentInfoQuery.data ?? [], currentGroup).map(
    (instrument) => ({ id: instrument.id, title: instrument.details.title })
  );

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {mode === 'CREATE'
            ? t({ en: 'Create Remote Assignments', es: 'Crear tareas remotas', fr: 'Créer des tâches à distance' })
            : mode === 'DELETE'
              ? t({
                  en: 'Delete Remote Assignments',
                  es: 'Eliminar tareas remotas',
                  fr: 'Supprimer des tâches à distance'
                })
              : t({ en: 'Remote Assignments', es: 'Tareas remotas', fr: 'Tâches à distance' })}
        </Heading>
      </PageHeader>

      {mode === 'LANDING' && (
        <div
          className="mx-auto mt-16 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2"
          data-testid="remote-assignments-landing"
        >
          <ActionCard
            icon={<CompositeIcon Badge={PlusIcon} />}
            testId="remote-assignments-create"
            title={t({ en: 'Create Assignments', es: 'Crear tareas', fr: 'Créer des tâches' })}
            onClick={() => setMode('CREATE')}
          />
          <ActionCard
            icon={<CompositeIcon Badge={Trash2Icon} />}
            testId="remote-assignments-delete"
            title={t({ en: 'Delete Assignments', es: 'Eliminar tareas', fr: 'Supprimer des tâches' })}
            onClick={() => setMode('DELETE')}
          />
        </div>
      )}

      {mode === 'CREATE' && (
        <BulkRemoteAssignmentWizard
          defaultExpiresAt={toBasicISOString(
            getDefaultAssignmentExpiry(setupStateQuery.data.defaultAssignmentDurationDays)
          )}
          groupId={currentGroup.id}
          groupName={currentGroup.name}
          instruments={instruments}
          subjectIdDisplayLength={currentGroup.settings.subjectIdDisplayLength ?? 9}
          subjects={subjectsQuery.data}
        />
      )}

      {mode === 'DELETE' && (
        <div className="mx-auto w-full max-w-280">
          <DeleteRemoteAssignments
            groupId={currentGroup.id}
            subjectIdDisplayLength={currentGroup.settings.subjectIdDisplayLength ?? 9}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/group/remote-assignments')({
  beforeLoad: async ({ context }) => {
    if (!config.setup.isGatewayEnabled) {
      throw redirect({ to: '/dashboard' });
    }
    const setupState = await context.queryClient.ensureQueryData(setupStateQueryOptions());
    if (!setupState.isBulkRemoteAssignmentsEnabled) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent,
  loader: ({ context }) => {
    const groupId = useAppStore.getState().currentGroup?.id;
    void context.queryClient.ensureQueryData(setupStateQueryOptions());
    void context.queryClient.ensureQueryData(subjectsQueryOptions({ params: { groupId } }));
  },
  validateSearch: (search: { [key: string]: unknown }): { mode?: 'create' | 'delete' } => ({
    mode: search.mode === 'create' || search.mode === 'delete' ? search.mode : undefined
  })
});
