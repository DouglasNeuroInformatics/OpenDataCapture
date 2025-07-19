import { Heading, Select, StatisticCard } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ClipboardDocumentIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import type { AppSubjectName } from '@opendatacapture/schemas/core';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { summaryQueryOptions, useSummaryQuery } from '@/hooks/useSummaryQuery';
import { useAppStore } from '@/store';

const RouteComponent = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();
  const summaryQuery = useSummaryQuery({ params: { groupId: currentGroup?.id } });

  let welcome: string;
  if (currentGroup?.type === 'CLINICAL') {
    welcome = t({
      en: 'Overview of Your Clinic',
      fr: "Vue d'ensemble de votre clinique"
    });
  } else if (currentGroup?.type === 'RESEARCH') {
    welcome = t({
      en: 'Overview of Your Research Group',
      fr: "Vue d'ensemble de votre groupe de recherche"
    });
  } else {
    welcome = t({
      en: 'Summary of Application State',
      fr: 'La cliente actuelle'
    });
  }

  // should never happen, as data is ensured in loader, but avoid crashing the app if someone changes this
  if (!summaryQuery.data) {
    return null;
  }

  return (
    <div className="flex grow flex-col">
      <PageHeader className="text-center">
        <Heading variant="h2">
          {t({
            en: 'Dashboard',
            fr: 'Tableau de bord'
          })}
        </Heading>
      </PageHeader>
      <section className="flex grow flex-col gap-5">
        <div className="flex w-full flex-col flex-wrap justify-between gap-3 md:flex-row md:items-center">
          <Heading className="whitespace-nowrap" variant="h3">
            {welcome}
          </Heading>
          {/* unless the user is an admin, this is set at login */}
          {currentGroup && (
            <Select
              value={currentGroup.id}
              onValueChange={(id) => changeGroup(currentUser!.groups.find((group) => group.id === id)!)!}
            >
              <Select.Trigger className="w-full md:w-[180px]">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  {currentUser?.groups.map((group) => (
                    <Select.Item key={group.id} value={group.id}>
                      {group.name}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select>
          )}
        </div>
        <div className="body-font">
          <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
            <StatisticCard
              icon={<UsersIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Users',
                fr: "Nombre d'utilisateurs"
              })}
              value={summaryQuery.data.counts.users}
            />
            <StatisticCard
              icon={<UserIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Subjects',
                fr: 'Nombre de clients'
              })}
              value={summaryQuery.data.counts.subjects}
            />
            <StatisticCard
              icon={<ClipboardDocumentIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Instruments',
                fr: "Nombre d'instruments"
              })}
              value={summaryQuery.data.counts.instruments}
            />
            <StatisticCard
              icon={<DocumentTextIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Records',
                fr: "Nombre d'enregistrements"
              })}
              value={summaryQuery.data.counts.records}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { currentGroup, currentUser } = useAppStore.getState();

    const ability = currentUser?.ability;
    const subjects: AppSubjectName[] = ['Instrument', 'InstrumentRecord', 'Subject', 'User'];
    const isAuthorized = subjects.every((subject) => ability?.can('read', subject));

    if (!isAuthorized) {
      throw redirect({ to: '/session/start-session' });
    }

    await context.queryClient.ensureQueryData(
      summaryQueryOptions({
        params: {
          groupId: currentGroup?.id
        }
      })
    );
  }
});
