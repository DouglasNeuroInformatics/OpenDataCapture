import React, { Fragment, useCallback, useMemo, useState } from 'react';

import { snakeToCamelCase, toLowerCase } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, DropdownMenu, Heading, TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useDownload, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $AuditLogsQuerySearchParams } from '@opendatacapture/schemas/audit';
import type {
  $AuditLog,
  $AuditLogAction,
  $AuditLogEntity,
  $AuditLogsQuerySearchParams as AuditLogsSearchParams
} from '@opendatacapture/schemas/audit';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, DownloadIcon, XIcon } from 'lucide-react';

import { FilterMenu } from '@/components/FilterMenu';
import { PageHeader } from '@/components/PageHeader';
import { auditLogsQueryOptions, fetchAllAuditLogs, useAuditLogsQuery } from '@/hooks/useAuditLogsQuery';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';

type DateFormat = 'iso' | 'local';

type SortOrder = 'asc' | 'desc';

const ACTIONS: $AuditLogAction[] = ['CREATE', 'DELETE', 'UPDATE', 'LOGIN', 'SEND_EMAIL'];

const ENTITIES: $AuditLogEntity[] = [
  'ASSIGNMENT',
  'GROUP',
  'INSTRUMENT',
  'INSTRUMENT_RECORD',
  'SESSION',
  'SUBJECT',
  'USER'
];

// The sort direction is rendered from the value the rows were actually fetched with, rather than from
// `column.getIsSorted()`: in server mode the table mounts with no sorting state of its own, so the
// column would read as unsorted even though the server has already ordered by timestamp descending.
const SortableHeader = ({
  column,
  label,
  sortOrder
}: {
  column: TanstackTable.Column<$AuditLog>;
  label: string;
  sortOrder: SortOrder;
}) => {
  return (
    <button
      className="hover:text-foreground flex items-center gap-2"
      type="button"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      {sortOrder === 'asc' ? (
        <ArrowUpIcon className="opacity-50" style={{ height: '14px', width: 'auto' }} />
      ) : (
        <ArrowDownIcon className="opacity-50" style={{ height: '14px', width: 'auto' }} />
      )}
    </button>
  );
};

const DateFormatMenu = ({ onChange, value }: { onChange: (value: DateFormat) => void; value: DateFormat }) => {
  const { t } = useTranslation();
  const options: { label: string; value: DateFormat }[] = [
    { label: t('common.localFormat'), value: 'local' },
    { label: 'ISO 8601', value: 'iso' }
  ];
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <button aria-label={t('common.dateFormat')} className="opacity-50 hover:opacity-100" type="button">
          <CalendarIcon style={{ height: '14px', width: 'auto' }} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Label>{t('common.dateFormat')}</DropdownMenu.Label>
        {options.map((option) => (
          <DropdownMenu.CheckboxItem
            checked={value === option.value}
            key={option.value}
            onCheckedChange={() => onChange(option.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {option.label}
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const AuditLogsToolbar = () => {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { data: groups } = useGroupsQuery();
  const { data: users } = useUsersQuery();

  const { t } = useTranslation();

  const download = useDownload();

  const setSearch = (patch: Partial<AuditLogsSearchParams>) => {
    void navigate({ search: (current) => ({ ...current, ...patch }), to: '.' });
  };

  const availableUsers = search.groupId ? users.filter((user) => user.groupIds.includes(search.groupId!)) : users;
  const hasFilters = Object.values(search).some((value) => value !== undefined);

  const localize = (value: $AuditLogAction | $AuditLogEntity) => t(`common.${snakeToCamelCase(toLowerCase(value))}`);

  return (
    <div className="flex flex-wrap items-center gap-2 pb-4" data-testid="audit-logs-toolbar">
      <FilterMenu
        allLabel={t({ en: 'All Groups', fr: 'Tous les groupes' })}
        data-testid="audit-logs-filter-group"
        label={t('common.group')}
        options={groups.map((group) => ({ label: group.name, value: group.id }))}
        value={search.groupId}
        onValueChange={(groupId) => {
          const selectedUser = users.find((user) => user.id === search.userId);
          const userId = !groupId || selectedUser?.groupIds.includes(groupId) ? search.userId : undefined;
          setSearch({ groupId, userId });
        }}
      />
      <FilterMenu
        allLabel={t({ en: 'All Users', fr: 'Tous les utilisateurs' })}
        data-testid="audit-logs-filter-user"
        label={t('common.user')}
        options={availableUsers.map((user) => ({ label: user.username, value: user.id }))}
        value={search.userId}
        onValueChange={(userId) => setSearch({ userId })}
      />
      <FilterMenu
        allLabel={t({ en: 'Any Action', fr: 'Toute action' })}
        data-testid="audit-logs-filter-action"
        label={t('common.action')}
        options={ACTIONS.map((action) => ({ label: localize(action), value: action }))}
        value={search.action}
        onValueChange={(action) => setSearch({ action })}
      />
      <FilterMenu
        allLabel={t({ en: 'Any Entity', fr: 'Toute entité' })}
        data-testid="audit-logs-filter-entity"
        label={t('common.entity')}
        options={ENTITIES.map((entity) => ({ label: localize(entity), value: entity }))}
        value={search.entity}
        onValueChange={(entity) => setSearch({ entity })}
      />
      {hasFilters && (
        <Button
          className="text-muted-foreground hover:text-foreground gap-1.5"
          data-testid="audit-logs-clear-filters"
          size="sm"
          variant="ghost"
          onClick={() => void navigate({ search: {}, to: '.' })}
        >
          <XIcon className="h-3.5 w-3.5" />
          {t({ en: 'Clear Filters', fr: 'Effacer les filtres' })}
        </Button>
      )}
      <Button
        className="ml-auto gap-2"
        type="button"
        variant="outline"
        onClick={() => {
          // The table only holds the page currently displayed, so the download refetches every log
          // matching the active filters rather than exporting what happens to be on screen.
          void download(`ODC_Audit_Logs_${Date.now()}.json`, async () => {
            const logs = await fetchAllAuditLogs(search);
            return JSON.stringify(logs, null, 2);
          });
        }}
      >
        {t('core.download')}
        <DownloadIcon className="opacity-50" style={{ height: '14px', width: 'auto' }} />
      </Button>
    </div>
  );
};

const AuditLogsTable: React.FC<{ search: AuditLogsSearchParams }> = ({ search }) => {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const auditLogsQuery = useAuditLogsQuery({ params: { ...search, page, sortOrder } });

  const { resolvedLanguage, t } = useTranslation();

  const [dateFormat, setDateFormat] = useState<DateFormat>('local');

  const datetimeFormat = useMemo(() => {
    return new Intl.DateTimeFormat(resolvedLanguage, {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  }, [resolvedLanguage]);

  const formatTimestamp = useCallback(
    (value: number) => {
      return dateFormat === 'iso' ? new Date(value).toISOString() : datetimeFormat.format(value);
    },
    [dateFormat, datetimeFormat]
  );

  return (
    <DataTable
      disableSearch
      columns={[
        {
          accessorKey: 'timestamp',
          cell: (ctx) => {
            const value = ctx.getValue() as number;
            return formatTimestamp(value);
          },
          enableResizing: false,
          enableSorting: true,
          header: ({ column }) => (
            <div className="flex items-center gap-2">
              <SortableHeader column={column} label={t('common.time')} sortOrder={sortOrder} />
              <DateFormatMenu value={dateFormat} onChange={setDateFormat} />
            </div>
          ),
          size: 250
        },
        {
          accessorFn: (row) => row.user?.username ?? 'N/A',
          cell: (ctx) => {
            const value = ctx.getValue() as string;
            return <span className="overflow-hidden text-ellipsis whitespace-nowrap">{value}</span>;
          },
          header: t('common.user'),
          id: 'user'
        },
        {
          accessorFn: (row) => row.group?.name ?? 'N/A',
          cell: (ctx) => {
            const value = ctx.getValue() as string;
            return <span className="overflow-hidden text-ellipsis whitespace-nowrap">{value}</span>;
          },
          header: t('common.activeGroup'),
          id: 'group'
        },
        {
          accessorKey: 'action',
          cell: (ctx) => {
            const value = ctx.getValue() as $AuditLogAction;
            return (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {t(`common.${snakeToCamelCase(toLowerCase(value))}`)}
              </span>
            );
          },
          header: t('common.action')
        },
        {
          accessorKey: 'entity',
          cell: (ctx) => {
            const value = ctx.getValue() as $AuditLogEntity;
            return (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {t(`common.${snakeToCamelCase(toLowerCase(value))}`)}
              </span>
            );
          },
          header: t('common.entity')
        }
      ]}
      data={auditLogsQuery.data?.data ?? []}
      mode="server"
      pageCount={auditLogsQuery.data?.pageCount ?? 0}
      onPaginationChange={({ pageIndex }) => setPage(pageIndex + 1)}
      onSortingChange={(state) => {
        const timestamp = state.find(({ id }) => id === 'timestamp');
        if (timestamp) {
          setSortOrder(timestamp.desc ? 'desc' : 'asc');
          setPage(1);
        }
      }}
    />
  );
};

const RouteComponent = () => {
  const search = Route.useSearch();
  const { t } = useTranslation();

  return (
    <Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('common.auditLogs')}
        </Heading>
      </PageHeader>
      <AuditLogsToolbar />
      {/* Remounted when the filters change: in server mode the table owns its page index and offers no
          way to set it, so a fresh store is the only way to return it to the first page. */}
      <AuditLogsTable key={JSON.stringify(search)} search={search} />
    </Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/audit/logs')({
  component: RouteComponent,
  loaderDeps: ({ search }) => ({ search }),
  // eslint-disable-next-line perfectionist/sort-objects
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(auditLogsQueryOptions({ params: deps.search })),
      context.queryClient.ensureQueryData(groupsQueryOptions()),
      context.queryClient.ensureQueryData(usersQueryOptions())
    ]);
  },
  validateSearch: $AuditLogsQuerySearchParams
});
