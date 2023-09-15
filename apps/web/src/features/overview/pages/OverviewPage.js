import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiClipboardDocument, HiDocumentText, HiUser, HiUsers } from 'react-icons/hi2';
import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { StatisticCard } from '../components/StatisticCard';
import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useAuthStore } from '@/stores/auth-store';
export var OverviewPage = function () {
  var _a = useAuthStore(),
    currentUser = _a.currentUser,
    currentGroup = _a.currentGroup;
  var t = useTranslation().t;
  var pageTitle = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName)
    ? ''.concat(t('overview.welcome'), ', ').concat(currentUser.firstName)
    : t('overview.welcome');
  var groupQuery = currentGroup ? '?group='.concat(currentGroup.name) : '';
  var forms = useFetch('/v1/instruments/forms/available', [], {
    access: { action: 'read', subject: 'User' }
  });
  var records = useFetch('/v1/instruments/records/forms/summary' + groupQuery, [currentGroup], {
    access: { action: 'read', subject: 'User' }
  });
  var subjects = useFetch('/v1/subjects' + groupQuery, [currentGroup], {
    access: { action: 'read', subject: 'User' }
  });
  var users = useFetch('/v1/users' + groupQuery, [currentGroup], {
    access: { action: 'read', subject: 'User' }
  });
  var isAllDataDefined = forms.data && records.data && subjects.data && users.data;
  var isAnyLoading = forms.isLoading || records.isLoading || subjects.isLoading || users.isLoading;
  // If it is the first time loading data
  if (!isAllDataDefined && isAnyLoading) {
    return React.createElement(Spinner, null);
  }
  return React.createElement(
    'div',
    null,
    React.createElement(Disclaimer, { isRequired: import.meta.env.PROD }),
    React.createElement(PageHeader, { title: pageTitle }),
    React.createElement(
      'section',
      null,
      React.createElement(
        'div',
        { className: 'mb-5' },
        React.createElement('h3', { className: 'text-center text-xl font-medium lg:text-left' }, t('overview.summary')),
        React.createElement(GroupSwitcher, null)
      ),
      React.createElement(
        'div',
        { className: 'body-font' },
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 gap-5 text-center lg:grid-cols-2' },
          forms.data &&
            records.data &&
            subjects.data &&
            users.data &&
            React.createElement(
              React.Fragment,
              null,
              React.createElement(StatisticCard, {
                icon: React.createElement(HiUsers, null),
                label: t('overview.totalUsers'),
                value: users.data.length
              }),
              React.createElement(StatisticCard, {
                icon: React.createElement(HiUser, null),
                label: t('overview.totalSubjects'),
                value: subjects.data.length
              }),
              React.createElement(StatisticCard, {
                icon: React.createElement(HiClipboardDocument, null),
                label: t('overview.totalInstruments'),
                value: forms.data.length
              }),
              React.createElement(StatisticCard, {
                icon: React.createElement(HiDocumentText, null),
                label: t('overview.totalRecords'),
                value: records.data.count
              })
            )
        )
      )
    )
  );
};
export default OverviewPage;
