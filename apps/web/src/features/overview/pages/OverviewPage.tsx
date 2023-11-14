import { ClipboardDocumentIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import type { Summary } from '@open-data-capture/common/summary';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/stores/auth-store';

import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { StatisticCard } from '../components/StatisticCard';

export const OverviewPage = () => {
  const { currentGroup, currentUser } = useAuthStore();
  const { t } = useTranslation('overview');

  const pageTitle = currentUser?.firstName ? `${t('welcome')}, ${currentUser.firstName}` : t('welcome');

  const query = useQuery({
    enabled: currentUser?.ability.can('read', 'Summary'),
    queryFn: () => {
      return axios
        .get<Summary>('/v1/summary', {
          params: {
            groupId: currentGroup?.id
          }
        })
        .then((response) => response.data);
    },
    queryKey: ['summary', currentGroup?.id]
  });

  return (
    <div>
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader title={pageTitle} />
      <section>
        <div className="mb-5">
          <h3 className="text-center text-xl font-medium lg:text-left">{t('summary')}</h3>
          <GroupSwitcher />
        </div>
        {query.data && (
          <div className="body-font">
            <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
              <StatisticCard
                icon={<UsersIcon className="h-12 w-12" />}
                label={t('totalUsers')}
                value={query.data.counts.users}
              />
              <StatisticCard
                icon={<UserIcon className="h-12 w-12" />}
                label={t('totalSubjects')}
                value={query.data.counts.subjects}
              />
              <StatisticCard
                icon={<ClipboardDocumentIcon className="h-12 w-12" />}
                label={t('totalInstruments')}
                value={query.data.counts.instruments}
              />
              <StatisticCard
                icon={<DocumentTextIcon className="h-12 w-12" />}
                label={t('totalRecords')}
                value={query.data.counts.records}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
