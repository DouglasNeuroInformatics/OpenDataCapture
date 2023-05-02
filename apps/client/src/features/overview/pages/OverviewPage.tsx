import React from 'react';

import { FormInstrumentRecordsSummary, FormInstrumentSummary, Subject, User } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { HiClipboardDocument, HiDocumentText, HiUser, HiUsers } from 'react-icons/hi2';

import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { StatisticCard } from '../components/StatisticCard';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useAuthStore } from '@/stores/auth-store';

export const OverviewPage = () => {
  const { currentUser, currentGroup } = useAuthStore();
  const { t } = useTranslation('overview');
  const pageTitle = currentUser?.firstName ? `${t('welcome')}, ${currentUser.firstName}` : t('welcome');

  const groupQuery = currentGroup ? `?group=${currentGroup.name}` : '';

  const forms = useFetch<FormInstrumentSummary[]>('/instruments/forms/available', [], {
    access: { action: 'read', subject: 'Instrument' }
  });

  const records = useFetch<FormInstrumentRecordsSummary>(
    '/instruments/records/forms/summary' + groupQuery,
    [currentGroup],
    {
      access: { action: 'read', subject: 'User' }
    }
  );

  const subjects = useFetch<Subject[]>('/subjects' + groupQuery, [currentGroup], {
    access: { action: 'read', subject: 'User' }
  });
  const users = useFetch<User[]>('/users' + groupQuery, [currentGroup], {
    access: { action: 'read', subject: 'User' }
  });

  if (forms.isLoading || records.isLoading || subjects.isLoading || users.isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader title={pageTitle} />
      <section>
        <div className="mb-5">
          <h3 className="text-center text-xl font-medium lg:text-left">{t('summary')}</h3>
          <GroupSwitcher />
        </div>
        <div className="body-font text-slate-600">
          <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
            {users.data && <StatisticCard icon={<HiUsers />} label={t('stats.totalUsers')} value={users.data.length} />}
            {subjects.data && (
              <StatisticCard icon={<HiUser />} label={t('stats.totalSubjects')} value={subjects.data.length} />
            )}
            {forms.data && (
              <StatisticCard
                icon={<HiClipboardDocument />}
                label={t('stats.totalInstruments')}
                value={forms.data.length}
              />
            )}
            {records.data && (
              <StatisticCard icon={<HiDocumentText />} label={t('stats.totalRecords')} value={records.data.count} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
