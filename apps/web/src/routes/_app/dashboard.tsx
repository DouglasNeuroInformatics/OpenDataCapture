import React, { useState } from 'react';

import { Dialog, Heading, Select, StatisticCard } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import { ClipboardDocumentIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import type { AppSubjectName } from '@opendatacapture/schemas/core';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { summaryQueryOptions, useSummaryQuery } from '@/hooks/useSummaryQuery';
import { useAppStore } from '@/store';
import { useUsersQuery } from '@/hooks/useUsersQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';

const RouteComponent = () => {
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();
  const [theme] = useTheme();
  const summaryQuery = useSummaryQuery({ params: { groupId: currentGroup?.id } });
  const navigate = useNavigate();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isUserLookupOpen, setIsUserLookupOpen] = useState(false);
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const userInfoQuery = useUsersQuery();

  const recordsQuery = useInstrumentRecords({
    enabled: true,
    params: {
      groupId: currentGroup?.id
    }
  });

  const instrumentData = currentGroup
    ? instrumentInfoQuery.data?.filter((instrument) => {
        return currentGroup.accessibleInstrumentIds.includes(instrument.id);
      })
    : instrumentInfoQuery.data;

  const instrumentInfo = instrumentData?.map((instrument) => {
    return {
      kind: instrument.kind,
      title: instrument.details.title,
      id: instrument.id
    };
  });

  const recordIds = recordsQuery.data?.map((record) => record.instrumentId);

  const recordCounter =
    instrumentInfo?.map((title) => {
      return {
        instrumentTitle: title.title,
        count: recordIds?.filter((val) => val === title.id).length ?? 0
      };
    }) ?? [];

  const chartColors = {
    records: {
      fill: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
      gradient: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)',
      stroke: theme === 'dark' ? '#3b82f6' : '#2563eb' // blue-500/blue-600
    },
    sessions: {
      fill: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
      gradient: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)',
      stroke: theme === 'dark' ? '#10b981' : '#059669' // emerald-500/emerald-600
    },
    subjects: {
      fill: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.1)',
      gradient: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.2)',
      stroke: theme === 'dark' ? '#f59e0b' : '#d97706' // amber-500/amber-600
    }
  };

  const strokeColors: { [K in Theme]: string } = {
    dark: '#cbd5e1', // slate-300
    light: '#475569' // slate-600
  };

  const tooltipStyles: { [K in Theme]: React.CSSProperties } = {
    dark: {
      backgroundColor: '#1e293b', // slate-800
      border: '1px solid',
      borderColor: '#475569', // slate-600
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      padding: '12px'
    },
    light: {
      backgroundColor: '#ffffff',
      border: '1px solid',
      borderColor: '#e2e8f0', // slate-200
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '12px'
    }
  };

  // Merge records and sessions data for combined chart
  const combinedTrendsData =
    summaryQuery.data?.trends.records
      .map((record, index) => ({
        records: record.value,
        sessions: summaryQuery.data?.trends.sessions[index]?.value ?? 0,
        timestamp: record.timestamp
      }))
      .reverse() ?? [];

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
      <section className="flex grow flex-col gap-8 p-6">
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
              <Select.Trigger className="w-full md:w-[180px]" data-testid="dashboard-group-select">
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
        <div className="body-font" data-testid="dashboard-statistics">
          <div className="grid grid-cols-1 gap-6 text-center lg:grid-cols-2 xl:grid-cols-4">
            <div
              className="group flex transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-users"
            >
              <Dialog open={isUserLookupOpen} onOpenChange={setIsUserLookupOpen}>
                <Dialog.Trigger className="grow">
                  <StatisticCard
                    icon={
                      <UsersIcon className="h-12 w-12 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400" />
                    }
                    label={t({
                      en: 'Total Users',
                      fr: "Nombre d'utilisateurs"
                    })}
                    value={summaryQuery.data.counts.users}
                  />
                </Dialog.Trigger>
                <Dialog.Content data-spotlight-type="subject-lookup-modal" data-testid="datahub-subject-lookup-dialog">
                  <Dialog.Header>
                    <Dialog.Title>
                      {t({
                        en: 'Users',
                        fr: 'Les utilisateurs'
                      })}
                    </Dialog.Title>
                  </Dialog.Header>
                  <ul className="flex flex-col gap-5">
                    <AnimatePresence mode="popLayout">
                      {userInfoQuery.data?.map((user, i) => {
                        return (
                          <motion.li
                            layout
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            key={user.username}
                            transition={{ bounce: 0.2, delay: 0.15 * i, duration: 1.5, type: 'spring' }}
                          >
                            <div className="flex justify-between gap-4">
                              <p>{user.username}</p>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </Dialog.Content>
              </Dialog>
            </div>
            <button
              className="group transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-subjects"
              onClick={() => {
                void navigate({
                  to: '/datahub'
                });
              }}
            >
              <StatisticCard
                icon={
                  <UserIcon className="h-12 w-12 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400" />
                }
                label={t({
                  en: 'Total Subjects',
                  fr: 'Nombre de clients'
                })}
                value={summaryQuery.data.counts.subjects}
              />
            </button>
            <div
              className="group flex transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-instruments"
            >
              <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
                <Dialog.Trigger className="grow">
                  <StatisticCard
                    icon={
                      <ClipboardDocumentIcon className="h-12 w-12 text-amber-600 transition-transform duration-300 group-hover:scale-110 dark:text-amber-400" />
                    }
                    label={t({
                      en: 'Total Instruments',
                      fr: "Nombre d'instruments"
                    })}
                    value={summaryQuery.data.counts.instruments}
                  ></StatisticCard>
                </Dialog.Trigger>
                <Dialog.Content data-spotlight-type="subject-lookup-modal" data-testid="datahub-subject-lookup-dialog">
                  <Dialog.Header>
                    <Dialog.Title>
                      {t({
                        en: 'Available Instruments',
                        fr: 'Les instruments'
                      })}
                    </Dialog.Title>
                  </Dialog.Header>
                  <ul className="flex flex-col gap-5">
                    <AnimatePresence mode="popLayout">
                      <div className="flex justify-between gap-4 font-bold">
                        <p>
                          {t({
                            en: 'Title',
                            fr: 'Titre'
                          })}
                        </p>{' '}
                        <p>{t({ en: 'Kind' })}</p>
                      </div>
                      {instrumentInfo?.map((instrument, i) => {
                        return (
                          <motion.li
                            layout
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            key={instrument.title}
                            transition={{ bounce: 0.2, delay: 0.15 * i, duration: 1.5, type: 'spring' }}
                          >
                            <div className="flex justify-between gap-4">
                              <p>{instrument.title}</p> <p>{instrument.kind}</p>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </Dialog.Content>
              </Dialog>
            </div>
            <div
              className="group transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-records"
            >
              <StatisticCard
                icon={
                  <DocumentTextIcon className="h-12 w-12 text-purple-600 transition-transform duration-300 group-hover:scale-110 dark:text-purple-400" />
                }
                label={t({
                  en: 'Total Records',
                  fr: "Nombre d'enregistrements"
                })}
                value={summaryQuery.data.counts.records}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div
            className="group rounded-2xl border border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-blue-300/60 hover:shadow-2xl dark:border-slate-700/60 dark:bg-slate-800/90 dark:hover:border-blue-600/60"
            data-testid="dashboard-chart-records-sessions"
          >
            <div className="p-8 pb-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 p-3 transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-indigo-600/30">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Heading className="text-slate-800 dark:text-slate-200" variant="h4">
                    {t({
                      en: 'Records & Sessions Trend',
                      fr: 'Tendance des enregistrements et sessions'
                    })}
                  </Heading>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t({
                      en: 'Activity over time',
                      fr: 'Activité au fil du temps'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 pt-2">
              <ResponsiveContainer height={320} width="100%">
                <AreaChart data={combinedTrendsData} margin={{ bottom: 0, left: 0, right: 30, top: 10 }}>
                  <defs>
                    <linearGradient id="recordsGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.records.stroke} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.records.stroke} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sessionsGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.sessions.stroke} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.sessions.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="timestamp"
                    domain={['auto', 'auto']}
                    stroke={strokeColors[theme]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(timestamp: number) => {
                      const date = new Date(timestamp);
                      return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                    }}
                    tickLine={false}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    stroke={strokeColors[theme]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    content={({ active, label, payload }) => {
                      if (active && payload?.length) {
                        const date = new Date(label as number);
                        return (
                          <div style={tooltipStyles[theme]}>
                            <p className="mb-2 text-sm font-medium">
                              {date.toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <div className="space-y-1">
                              <p className="font-semibold text-blue-600 dark:text-blue-400">
                                {t({
                                  en: 'Records',
                                  fr: 'Enregistrements'
                                })}
                                : {payload.find((p) => p.dataKey === 'records')?.value ?? 0}
                              </p>
                              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {t({
                                  en: 'Sessions',
                                  fr: 'Sessions'
                                })}
                                : {payload.find((p) => p.dataKey === 'sessions')?.value ?? 0}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    activeDot={{ fill: chartColors.records.stroke, r: 6, stroke: '#fff', strokeWidth: 2 }}
                    dataKey="records"
                    dot={{ fill: chartColors.records.stroke, r: 4, strokeWidth: 2 }}
                    fill="url(#recordsGradient)"
                    stroke={chartColors.records.stroke}
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Area
                    activeDot={{ fill: chartColors.sessions.stroke, r: 6, stroke: '#fff', strokeWidth: 2 }}
                    dataKey="sessions"
                    dot={{ fill: chartColors.sessions.stroke, r: 4, strokeWidth: 2 }}
                    fill="url(#sessionsGradient)"
                    stroke={chartColors.sessions.stroke}
                    strokeWidth={3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div
            className="group rounded-2xl border border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-300/60 hover:shadow-2xl dark:border-slate-700/60 dark:bg-slate-800/90 dark:hover:border-amber-600/60"
            data-testid="dashboard-chart-subjects-growth"
          >
            <div className="p-8 pb-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-3 transition-all duration-300 group-hover:from-amber-500/30 group-hover:to-orange-600/30">
                  <UserIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <Heading className="text-slate-800 dark:text-slate-200" variant="h4">
                    {t({
                      en: 'Subjects Growth',
                      fr: 'Croissance des sujets'
                    })}
                  </Heading>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t({
                      en: 'Growth trajectory',
                      fr: 'Trajectoire de croissance'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 pt-2">
              <ResponsiveContainer height={320} width="100%">
                <AreaChart
                  data={summaryQuery.data.trends.subjects.slice().reverse()}
                  margin={{ bottom: 20, left: 0, right: 30, top: 10 }}
                >
                  <defs>
                    <linearGradient id="subjectsGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.subjects.stroke} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.subjects.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="timestamp"
                    domain={['auto', 'auto']}
                    stroke={strokeColors[theme]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(timestamp: number) => {
                      const date = new Date(timestamp);
                      return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                    }}
                    tickLine={false}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    stroke={strokeColors[theme]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    content={({ active, label, payload }) => {
                      if (active && payload?.length) {
                        const date = new Date(label as number);
                        return (
                          <div style={tooltipStyles[theme]}>
                            <p className="mb-2 text-sm font-medium">
                              {date.toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="font-semibold text-amber-600 dark:text-amber-400">
                              {t({
                                en: 'Subjects',
                                fr: 'Sujets'
                              })}
                              : {payload[0]?.value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    activeDot={{ fill: chartColors.subjects.stroke, r: 6, stroke: '#fff', strokeWidth: 2 }}
                    dataKey="value"
                    dot={{ fill: chartColors.subjects.stroke, r: 4, strokeWidth: 2 }}
                    fill="url(#subjectsGradient)"
                    stroke={chartColors.subjects.stroke}
                    strokeWidth={3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
    const subjects: AppSubjectName[] = ['Instrument', 'InstrumentRecord', 'Session', 'Subject', 'User'];
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
