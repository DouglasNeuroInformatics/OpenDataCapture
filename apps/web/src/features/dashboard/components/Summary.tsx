import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ClipboardDocumentIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import type { Summary as SummaryType } from '@opendatacapture/schemas/summary';

import { WithFallback } from '@/components/WithFallback';
import { useAppStore } from '@/store';

import { StatisticCard } from '../components/StatisticCard';
import { useSummaryQuery } from '../hooks/useSummaryQuery';

export const Summary = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation();

  const summaryQuery = useSummaryQuery({
    params: {
      groupId: currentGroup?.id
    }
  });

  return (
    <WithFallback
      Component={({ data }: { data: SummaryType }) => (
        <div className="body-font">
          <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
            <StatisticCard
              icon={<UsersIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Users',
                fr: "Nombre d'utilisateurs"
              })}
              value={data.counts.users}
            />
            <StatisticCard
              icon={<UserIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Subjects',
                fr: 'Nombre de clients'
              })}
              value={data.counts.subjects}
            />
            <StatisticCard
              icon={<ClipboardDocumentIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Instruments',
                fr: "Nombre d'instruments"
              })}
              value={data.counts.instruments}
            />
            <StatisticCard
              icon={<DocumentTextIcon className="h-12 w-12" />}
              label={t({
                en: 'Total Records',
                fr: "Nombre d'enregistrements"
              })}
              value={data.counts.records}
            />
          </div>
        </div>
      )}
      props={{
        data: summaryQuery.data
      }}
    />
  );
};
