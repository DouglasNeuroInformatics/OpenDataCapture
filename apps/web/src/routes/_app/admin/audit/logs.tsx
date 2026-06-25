import React, { Fragment, useCallback, useMemo, useState } from 'react';

import { snakeToCamelCase, toLowerCase } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, DropdownMenu, Heading, TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useDownload, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $AuditLogsQuerySearchParams } from '@opendatacapture/schemas/audit';
import type { $AuditLog, $AuditLogAction, $AuditLogEntity } from '@opendatacapture/schemas/audit';
import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  DownloadIcon
} from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { auditLogsQueryOptions, useAuditLogsQuery } from '@/hooks/useAuditLogsQuery';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';

type DateFormat = 'iso' | 'local';

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

const SortableHeader = ({ column, label }: { column: TanstackTable.Column<$AuditLog>; label: string }) => {
  const sorted = column.getIsSorted();
  return (
    <button
      className="hover:text-foreground flex items-center gap-2"
      type="button"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUpIcon className="opacity-50" style={{ height: '14px', width: 'auto' }} />
      ) : sorted === 'desc' ? (
        <ArrowDownIcon className="opacity-50" style={{ height: '14px', width: 'auto' }} />
      ) : (
        <ChevronsUpDownIcon className="opacity-50" style={{ height: '14px', width: 'auto' }} />
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

const Toggles: React.FC<{ table: TanstackTable.Table<$AuditLog> }> = ({ table }) => {
  const search = Route.useSearch();

  const [isOpen, setIsOpen] = useState(false);

  const { data: groups } = useGroupsQuery();
  const { data: users } = useUsersQuery();

  const { t } = useTranslation();

  const download = useDownload();

  const handleDownload = useCallback(() => {
    const data = table
      .getPrePaginationRowModel()
      .rows.map((row) => Object.fromEntries(row.getVisibleCells().map((cell) => [cell.column.id, cell.getValue()])));
    void download(`ODC_Audit_Logs_${Date.now()}.json`, JSON.stringify(data, null, 2));
  }, []);

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

const RouteComponent = () => {
  const search = Route.useSearch();

  const auditLogsQuery = useAuditLogsQuery({ search });

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
    <Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('common.auditLogs')}
        </Heading>
      </PageHeader>
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
                <SortableHeader column={column} label={t('common.time')} />
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
        data={auditLogsQuery.data}
        initialState={{
          columnPinning: {
            left: ['timestamp']
          },
          sorting: [{ desc: true, id: 'timestamp' }]
        }}
        togglesComponent={Toggles}
      />
    </Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/audit/logs')({
  component: RouteComponent,
  loaderDeps: ({ search }) => ({ search }),
  // eslint-disable-next-line perfectionist/sort-objects
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(auditLogsQueryOptions({ search: deps.search })),
      context.queryClient.ensureQueryData(groupsQueryOptions()),
      context.queryClient.ensureQueryData(usersQueryOptions())
    ]);
  },
  validateSearch: $AuditLogsQuerySearchParams
});
