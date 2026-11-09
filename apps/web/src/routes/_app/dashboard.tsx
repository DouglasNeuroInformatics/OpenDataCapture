import React, { useState } from 'react';

import { DataTable, Dialog, Heading, Spinner, StatisticCard } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { ClipboardDocumentIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import type { AppSubjectName } from '@opendatacapture/schemas/core';
import type { Summary, SummaryTrendWindow } from '@opendatacapture/schemas/summary';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { InstrumentKindCell } from '@/components/InstrumentKindCell';
import { PageHeader } from '@/components/PageHeader';
import { SortableHeader } from '@/components/SortableHeader';
import { TrendWindowSelect } from '@/components/TrendWindowSelect';
import { TruncatedCell } from '@/components/TruncatedCell';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';
import { summaryQueryOptions, useSummaryQuery } from '@/hooks/useSummaryQuery';
import { useUsersQuery } from '@/hooks/useUsersQuery';
import { useAppStore } from '@/store';

// A dialog's table is shown as plain text: libui's frame, row and cell borders are removed, and the
// column headers are set larger and bold to stand apart from the rows without them.
const TEXT_ONLY_TABLE = cn(
  '[&_[data-testid=data-table]>.border]:border-0 [&_[data-testid=data-table]>.border_*]:border-0',
  '[&_[data-testid=data-table-head]]:text-base [&_[data-testid=data-table-head]]:font-bold'
);

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** A chart axis label: day and month within a year, month and year for a trend reaching further back. */
const formatTrendTick = (timestamp: number, trend: Summary['trends']['records']) => {
  const spansYears = trend[0]!.timestamp - trend.at(-1)!.timestamp > ONE_YEAR_MS;
  return new Date(timestamp).toLocaleDateString(
    undefined,
    spansYears ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' }
  );
};

const RouteComponent = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation();
  const [theme] = useTheme();
  const [recordTrendWindow, setRecordTrendWindow] = useState<SummaryTrendWindow>('default');
  const [subjectTrendWindow, setSubjectTrendWindow] = useState<SummaryTrendWindow>('default');
  const summaryQuery = useSummaryQuery({
    params: { groupId: currentGroup?.id, recordTrendWindow, subjectTrendWindow }
  });
  const navigate = useNavigate();
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const allEditionsQuery = useInstrumentInfoQuery({ params: { allEditions: true } });
  const userInfoQuery = useUsersQuery({
    params: {
      groupId: currentGroup?.id
    }
  });

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
      id: instrument.id,
      kind: instrument.kind,
      title: instrument.details.title
    };
  });

  // A record keeps the id of the edition it was collected with, so records are counted under the
  // instrument's name to include every edition in the row for its latest one.
  const instrumentKeyById = new Map(
    allEditionsQuery.data?.map((instrument) => {
      return [instrument.id, instrument.kind === 'SERIES' ? instrument.id : instrument.internal.name];
    })
  );
  const instrumentKey = (instrumentId: string) => instrumentKeyById.get(instrumentId) ?? instrumentId;

  const recordKeys = recordsQuery.data?.map((record) => instrumentKey(record.instrumentId));

  const recordCounter =
    instrumentInfo?.map((title) => {
      return {
        count: recordKeys?.filter((key) => key === instrumentKey(title.id)).length ?? 0,
        id: title.id,
        instrumentTitle: title.title
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

  const recordsLabel = t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' });
  const sessionsLabel = t({ en: 'Sessions', es: 'Sesiones', fr: 'Sessions' });

  let welcome: string;
  if (currentGroup?.type === 'CLINICAL') {
    welcome = t({
      en: 'Overview of Your Clinic',
      es: 'Resumen de su clínica',
      fr: "Vue d'ensemble de votre clinique"
    });
  } else if (currentGroup?.type === 'RESEARCH') {
    welcome = t({
      en: 'Overview of Your Research Group',
      es: 'Resumen de su grupo de investigación',
      fr: "Vue d'ensemble de votre groupe de recherche"
    });
  } else {
    welcome = t({
      en: 'Summary of Application State',
      es: 'Resumen del estado de la aplicación',
      fr: "Résumé de l'état de l'application"
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
            es: 'Panel de control',
            fr: 'Tableau de bord'
          })}
        </Heading>
      </PageHeader>
      <section className="flex grow flex-col gap-8 p-6">
        <div data-testid="dashboard-welcome-heading">
          <Heading className="whitespace-nowrap" variant="h3">
            {welcome}
          </Heading>
        </div>
        <div className="body-font" data-testid="dashboard-statistics">
          <div className="grid grid-cols-1 gap-6 text-center lg:grid-cols-2 xl:grid-cols-4">
            <div
              className="group flex transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-users"
            >
              <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                <Dialog.Trigger className="grow">
                  <StatisticCard
                    icon={
                      <UsersIcon className="h-12 w-12 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400" />
                    }
                    label={t({
                      en: 'Total Users',
                      es: 'Total de usuarios',
                      fr: "Nombre d'utilisateurs"
                    })}
                    value={summaryQuery.data.counts.users}
                  />
                </Dialog.Trigger>
                <Dialog.Content data-spotlight-type="users-Modal-modal" data-testid="dashboard-users-Modal-dialog">
                  <Dialog.Header>
                    <Dialog.Title>
                      {t({
                        en: 'Users',
                        es: 'Usuarios',
                        fr: 'Utilisateurs'
                      })}
                    </Dialog.Title>
                  </Dialog.Header>
                  {userInfoQuery.isLoading && <Spinner />}
                  {userInfoQuery.isError && (
                    <p>
                      {t({
                        en: 'Error finding users',
                        es: 'Error al buscar los usuarios',
                        fr: "Erreur lors de la recherche d'utilisateurs"
                      })}
                    </p>
                  )}
                  {userInfoQuery.data && (
                    <div className={TEXT_ONLY_TABLE}>
                      <DataTable
                        columns={[
                          {
                            accessorKey: 'username',
                            cell: ({ getValue }) => (
                              <TruncatedCell title={getValue<string>()} value={getValue<string>()} />
                            ),
                            header: ({ column }) => (
                              <SortableHeader
                                column={column}
                                label={t({ en: 'Username', es: 'Nombre de usuario', fr: "Nom d'utilisateur" })}
                              />
                            ),
                            id: 'username'
                          }
                        ]}
                        data={userInfoQuery.data}
                      />
                    </div>
                  )}
                </Dialog.Content>
              </Dialog>
            </div>
            <button
              className="group flex transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-subjects"
              type="button"
              onClick={() => {
                void navigate({
                  to: '/datahub/subjects'
                });
              }}
            >
              <StatisticCard
                className="grow"
                icon={
                  <UserIcon className="h-12 w-12 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400" />
                }
                label={t({
                  en: 'Total Subjects',
                  es: 'Total de sujetos',
                  fr: 'Nombre total de sujets'
                })}
                value={summaryQuery.data.counts.subjects}
              />
            </button>
            <div
              className="group flex transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-instruments"
            >
              <Dialog open={isInstrumentModalOpen} onOpenChange={setIsInstrumentModalOpen}>
                <Dialog.Trigger className="grow">
                  <StatisticCard
                    icon={
                      <ClipboardDocumentIcon className="h-12 w-12 text-amber-600 transition-transform duration-300 group-hover:scale-110 dark:text-amber-400" />
                    }
                    label={t({
                      en: 'Total Instruments',
                      es: 'Total de instrumentos',
                      fr: "Nombre d'instruments"
                    })}
                    value={summaryQuery.data.counts.instruments}
                  />
                </Dialog.Trigger>
                <Dialog.Content
                  data-spotlight-type="instruments-Modal-modal"
                  data-testid="dashboard-instruments-Modal-dialog"
                >
                  <Dialog.Header>
                    <Dialog.Title>
                      {t({
                        en: 'Available Instruments',
                        es: 'Instrumentos disponibles',
                        fr: 'Instruments disponibles'
                      })}
                    </Dialog.Title>
                  </Dialog.Header>
                  {instrumentInfo ? (
                    <div className={TEXT_ONLY_TABLE}>
                      <DataTable
                        columns={[
                          {
                            accessorKey: 'title',
                            cell: ({ getValue }) => (
                              <TruncatedCell title={getValue<string>()} value={getValue<string>()} />
                            ),
                            header: ({ column }) => (
                              <SortableHeader column={column} label={t({ en: 'Title', es: 'Título', fr: 'Titre' })} />
                            ),
                            id: 'title'
                          },
                          {
                            accessorKey: 'kind',
                            cell: ({ getValue }) => <InstrumentKindCell kind={getValue<InstrumentKind>()} />,
                            header: ({ column }) => (
                              <SortableHeader column={column} label={t({ en: 'Kind', es: 'Tipo', fr: 'Type' })} />
                            ),
                            id: 'kind',
                            size: 140
                          }
                        ]}
                        data={instrumentInfo}
                        initialState={{ columnPinning: { right: ['kind'] } }}
                      />
                    </div>
                  ) : (
                    <p>
                      {t({
                        en: 'Error finding instruments',
                        es: 'Error al buscar los instrumentos',
                        fr: 'Erreur lors de la recherche des instruments'
                      })}
                    </p>
                  )}
                </Dialog.Content>
              </Dialog>
            </div>
            <div
              className="group flex transform transition-all duration-300 hover:scale-105"
              data-testid="statistic-records"
            >
              <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
                <Dialog.Trigger className="grow">
                  <StatisticCard
                    icon={
                      <DocumentTextIcon className="h-12 w-12 text-purple-600 transition-transform duration-300 group-hover:scale-110 dark:text-purple-400" />
                    }
                    label={t({
                      en: 'Total Records',
                      es: 'Total de registros',
                      fr: "Nombre d'enregistrements"
                    })}
                    value={summaryQuery.data.counts.records}
                  />
                </Dialog.Trigger>
                <Dialog.Content data-spotlight-type="record-Modal-modal" data-testid="dashboard-record-Modal-dialog">
                  <Dialog.Header>
                    <Dialog.Title>
                      {t({
                        en: 'Number of Records',
                        es: 'Número de registros',
                        fr: "Nombre d'enregistrements"
                      })}
                    </Dialog.Title>
                  </Dialog.Header>
                  {instrumentInfo ? (
                    <div className={TEXT_ONLY_TABLE}>
                      <DataTable
                        columns={[
                          {
                            accessorKey: 'instrumentTitle',
                            cell: ({ getValue }) => (
                              <TruncatedCell title={getValue<string>()} value={getValue<string>()} />
                            ),
                            header: ({ column }) => (
                              <SortableHeader column={column} label={t({ en: 'Title', es: 'Título', fr: 'Titre' })} />
                            ),
                            id: 'instrumentTitle'
                          },
                          {
                            accessorKey: 'count',
                            header: ({ column }) => (
                              <SortableHeader column={column} label={t({ en: 'Number', es: 'Número', fr: 'Nombre' })} />
                            ),
                            id: 'count',
                            size: 110
                          }
                        ]}
                        data={recordCounter}
                        initialState={{ columnPinning: { right: ['count'] }, sorting: [{ desc: true, id: 'count' }] }}
                      />
                    </div>
                  ) : (
                    <p>
                      {t({
                        en: 'Error finding records',
                        es: 'Error al buscar los registros',
                        fr: "Erreur lors de la recherche d'enregistrements"
                      })}
                    </p>
                  )}
                </Dialog.Content>
              </Dialog>
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
                <div className="rounded-xl bg-linear-to-br from-blue-500/20 to-indigo-600/20 p-3 transition-all duration-300 group-hover:from-blue-500/30 group-hover:to-indigo-600/30">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="grow">
                  {/* The window picker shares the title row so its label lines up with the title. */}
                  <div className="-mr-4 flex items-center justify-between gap-4">
                    <Heading className="text-slate-800 dark:text-slate-200" variant="h4">
                      {t({
                        en: 'Records & Sessions Trend',
                        es: 'Evolución de registros y sesiones',
                        fr: 'Tendance des enregistrements et des sessions'
                      })}
                    </Heading>
                    <div className="-my-1 shrink-0">
                      <TrendWindowSelect
                        data-testid="dashboard-records-trend-window"
                        value={recordTrendWindow}
                        onChange={setRecordTrendWindow}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t({
                      en: 'Activity over time',
                      es: 'Actividad a lo largo del tiempo',
                      fr: 'Activité au fil du temps'
                    })}
                  </p>
                </div>
              </div>
            </div>
            {/* recharts spaces legend items with an inline right margin, which also pushes the legend off
                centre; only an important class can replace it with an even margin on both sides. */}
            <div className="p-8 pt-2 [&_.recharts-legend-item]:mx-4!">
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
                    tickFormatter={(timestamp: number) => formatTrendTick(timestamp, summaryQuery.data.trends.records)}
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
                                {recordsLabel}: {payload.find((p) => p.dataKey === 'records')?.value ?? 0}
                              </p>
                              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {sessionsLabel}: {payload.find((p) => p.dataKey === 'sessions')?.value ?? 0}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* recharts sizes the legend to the plot area, which the chart's right margin shifts off the card's centre. */}
                  <Legend wrapperStyle={{ left: 0, paddingTop: 16, width: '100%' }} />
                  <Area
                    activeDot={{ fill: chartColors.records.stroke, r: 6, stroke: '#fff', strokeWidth: 2 }}
                    dataKey="records"
                    dot={{ fill: chartColors.records.stroke, r: 4, strokeWidth: 2 }}
                    fill="url(#recordsGradient)"
                    legendType="plainline"
                    name={recordsLabel}
                    stroke={chartColors.records.stroke}
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Area
                    activeDot={{ fill: chartColors.sessions.stroke, r: 6, stroke: '#fff', strokeWidth: 2 }}
                    dataKey="sessions"
                    dot={{ fill: chartColors.sessions.stroke, r: 4, strokeWidth: 2 }}
                    fill="url(#sessionsGradient)"
                    legendType="plainline"
                    name={sessionsLabel}
                    stroke={chartColors.sessions.stroke}
                    strokeDasharray="6 4"
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
                <div className="rounded-xl bg-linear-to-br from-amber-500/20 to-orange-600/20 p-3 transition-all duration-300 group-hover:from-amber-500/30 group-hover:to-orange-600/30">
                  <UserIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="grow">
                  {/* The window picker shares the title row so its label lines up with the title. */}
                  <div className="-mr-4 flex items-center justify-between gap-4">
                    <Heading className="text-slate-800 dark:text-slate-200" variant="h4">
                      {t({
                        en: 'Subjects Growth',
                        es: 'Crecimiento de sujetos',
                        fr: 'Croissance des sujets'
                      })}
                    </Heading>
                    <div className="-my-1 shrink-0">
                      <TrendWindowSelect
                        data-testid="dashboard-subjects-trend-window"
                        value={subjectTrendWindow}
                        onChange={setSubjectTrendWindow}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t({
                      en: 'Growth trajectory',
                      es: 'Trayectoria de crecimiento',
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
                    tickFormatter={(timestamp: number) => formatTrendTick(timestamp, summaryQuery.data.trends.subjects)}
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
                                es: 'Sujetos',
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
