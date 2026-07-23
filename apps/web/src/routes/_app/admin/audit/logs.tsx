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
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, ChevronDownIcon, DownloadIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { auditLogsQueryOptions, fetchAllAuditLogs, useAuditLogsQuery } from '@/hooks/useAuditLogsQuery';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';

type DateFormat = 'iso' | 'local';

type SortOrder = 'asc' | 'desc';

const ACTIONS: $AuditLogAction[] = ['CREATE', 'DELETE', 'UPDATE', 'LOGIN'];

const ENTITIES: $AuditLogEntity[] = [
  'ASSIGNMENT',
  'GROUP',
  'INSTRUMENT',
  'INSTRUMENT_RECORD',
  'SESSION',
  'SUBJECT',
  'USER'
];

const SelectSingleFilterGroup = ({
  label,
  options,
  searchKey
}: {
  label: string;
  options: {
    [key: string]: string;
  };
  searchKey: Extract<keyof $AuditLogsQuerySearchParams, string>;
}) => {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  return (
    <Fragment>
      <DropdownMenu.Label>{label}</DropdownMenu.Label>
      <DropdownMenu.Group>
        {Object.entries(options).map(([option, label]) => {
          return (
            <DropdownMenu.CheckboxItem
              checked={option === search[searchKey]}
              key={option}
              onCheckedChange={(checked) => {
                void navigate({
                  search: (search) => {
                    return { ...search, [searchKey]: checked ? option : undefined };
                  },
                  to: '.'
                });
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {label}
            </DropdownMenu.CheckboxItem>
          );
        })}
      </DropdownMenu.Group>
    </Fragment>
  );
};

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

const Toggles: React.FC<{ table: TanstackTable.Table<$AuditLog> }> = () => {
  const search = Route.useSearch();

  const [isOpen, setIsOpen] = useState(false);

  const { data: groups } = useGroupsQuery();
  const { data: users } = useUsersQuery();

  const { t } = useTranslation();

  const download = useDownload();

  // The table only holds the page currently displayed, so the download refetches every log matching
  // the active filters rather than exporting what happens to be on screen.
  const handleDownload = useCallback(() => {
    void download(`ODC_Audit_Logs_${Date.now()}.json`, async () => {
      const logs = await fetchAllAuditLogs(search);
      return JSON.stringify(logs, null, 2);
    });
  }, [search]);

  const availableUsers = search.groupId ? users.filter((user) => user.groupIds.includes(search.groupId!)) : users;

  return (
    <div className="flex gap-3">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <Button className="flex items-center justify-between gap-2" variant="outline">
            {t('common.filters')}
            <ChevronDownIcon className="opacity-50" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-56">
          <SelectSingleFilterGroup
            label={t('common.group')}
            options={Object.fromEntries(groups.map((group) => [group.id, group.name]))}
            searchKey="groupId"
          />
          <SelectSingleFilterGroup
            label={t('common.user')}
            options={Object.fromEntries(availableUsers.map((user) => [user.id, user.username]))}
            searchKey="userId"
          />
          <SelectSingleFilterGroup
            label={t('common.action')}
            options={Object.fromEntries(ACTIONS.map((action) => [action, t(`common.${toLowerCase(action)}`)]))}
            searchKey="action"
          />
          <SelectSingleFilterGroup
            label={t('common.entity')}
            options={Object.fromEntries(
              ENTITIES.map((entity) => [entity, t(`common.${snakeToCamelCase(toLowerCase(entity))}`)])
            )}
            searchKey="entity"
          />
        </DropdownMenu.Content>
      </DropdownMenu>
      <Button
        className="flex items-center justify-between gap-2"
        type="button"
        variant="outline"
        onClick={handleDownload}
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
                {t(`common.${toLowerCase(value)}`)}
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
      togglesComponent={Toggles}
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
