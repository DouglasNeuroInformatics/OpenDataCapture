import React from 'react';

import { FormInstrumentRecordsSummary, FormInstrumentSummary, Subject, User } from '@ddcp/types';
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
  const { t } = useTranslation();
  const pageTitle = currentUser?.firstName
    ? `${t('overview.welcome')}, ${currentUser.firstName}`
    : t('overview.welcome');

  const groupQuery = currentGroup ? `?group=${currentGroup.name}` : '';

  const forms = useFetch<FormInstrumentSummary[]>('/v1/instruments/forms/available', [], {
    access: { action: 'read', subject: 'User' }
  });

  const records = useFetch<FormInstrumentRecordsSummary>(
    '/v1/instruments/records/forms/summary' + groupQuery,
    [currentGroup],
    {
      access: { action: 'read', subject: 'User' }
    }
  );

  const subjects = useFetch<Subject[]>('/v1/subjects' + groupQuery, [currentGroup], {
    access: { action: 'read', subject: 'User' }
  });
  const users = useFetch<User[]>('/v1/users' + groupQuery, [currentGroup], {
    access: { action: 'read', subject: 'User' }
  });

  const isAllDataDefined = forms.data && records.data && subjects.data && users.data;
  const isAnyLoading = forms.isLoading || records.isLoading || subjects.isLoading || users.isLoading;

  // If it is the first time loading data
  if (!isAllDataDefined && isAnyLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader title={pageTitle} />
      <section>
        <div className="mb-5">
          <h3 className="text-center text-xl font-medium lg:text-left">{t('overview.summary')}</h3>
          <GroupSwitcher />
        </div>
        <div className="body-font">
          <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
            {forms.data && records.data && subjects.data && users.data && (
              <>
                <StatisticCard icon={<HiUsers />} label={t('overview.totalUsers')} value={users.data.length} />
                <StatisticCard icon={<HiUser />} label={t('overview.totalSubjects')} value={subjects.data.length} />
                <StatisticCard
                  icon={<HiClipboardDocument />}
                  label={t('overview.totalInstruments')}
                  value={forms.data.length}
                />
                <StatisticCard
                  icon={<HiDocumentText />}
                  label={t('overview.totalRecords')}
                  value={records.data.count}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
