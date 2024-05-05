import React from 'react';

import { ClipboardDocumentIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useAppStore } from '@/store';

import { StatisticCard } from '../components/StatisticCard';
import { useSummaryQuery } from '../hooks/useSummaryQuery';

export const Summary = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation('overview');

  const summaryQuery = useSummaryQuery({
    params: {
      groupId: currentGroup?.id
    }
  });

  if (!summaryQuery.data) {
    return <LoadingFallback />;
  }

  return (
    <div className="body-font">
      <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
        <StatisticCard
          icon={<UsersIcon className="h-12 w-12" />}
          label={t('totalUsers')}
          value={summaryQuery.data.counts.users}
        />
        <StatisticCard
          icon={<UserIcon className="h-12 w-12" />}
          label={t('totalSubjects')}
          value={summaryQuery.data.counts.subjects}
        />
        <StatisticCard
          icon={<ClipboardDocumentIcon className="h-12 w-12" />}
          label={t('totalInstruments')}
          value={summaryQuery.data.counts.instruments}
        />
        <StatisticCard
          icon={<DocumentTextIcon className="h-12 w-12" />}
          label={t('totalRecords')}
          value={summaryQuery.data.counts.records}
        />
      </div>
    </div>
  );
};
