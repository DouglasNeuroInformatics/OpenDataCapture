import React from 'react';

import { useTranslation } from 'react-i18next';
import { HiClipboardDocument, HiDocumentText, HiUser, HiUsers } from 'react-icons/hi2';

import { StatisticCard } from '../components/StatisticCard';

import { PageHeader } from '@/components';
import { useAuthStore } from '@/stores/auth-store';

export const OverviewPage = () => {
  const { currentUser } = useAuthStore();
  const { t } = useTranslation('overview');
  const pageTitle = currentUser?.firstName ? `${t('welcome')}, ${currentUser.firstName}` : t('welcome');

  return (
    <div>
      <PageHeader title={pageTitle} />
      <section>
        <h3 className="mb-5 text-xl font-medium">{t('summary')}</h3>
        <div className="body-font text-slate-600">
          <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
            <StatisticCard icon={<HiUsers />} label={t('stats.totalUsers')} value={5} />
            <StatisticCard icon={<HiUser />} label={t('stats.totalSubjects')} value={5} />
            <StatisticCard icon={<HiClipboardDocument />} label={t('stats.totalInstruments')} value={5} />
            <StatisticCard icon={<HiDocumentText />} label={t('stats.totalRecords')} value={5} />
          </div>
        </div>
      </section>
    </div>
  );
};
