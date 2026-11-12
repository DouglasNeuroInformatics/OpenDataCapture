import React, { Fragment, useCallback, useMemo, useState } from 'react';

import { snakeToCamelCase, toLowerCase } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, DropdownMenu, Heading } from '@douglasneuroinformatics/libui/components';
import { useDownload, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import {
  $AuditLogAction,
  $AuditLogEntity,
  $AuditLogsQuerySearchParams,
  $AuditLogsSortBy,
  AUDITED_ACTIONS
} from '@opendatacapture/schemas/audit';
import type {
  AuditedEntity,
  $AuditLogsQuerySearchParams as AuditLogsSearchParams
} from '@opendatacapture/schemas/audit';
import { createFileRoute } from '@tanstack/react-router';
import { CalendarIcon, DownloadIcon, XIcon } from 'lucide-react';

import { ColorTagCell } from '@/components/ColorTagCell';
import { FilterMenu } from '@/components/FilterMenu';
import { PageHeader } from '@/components/PageHeader';
import { SortableHeader } from '@/components/SortableHeader';
import { auditLogsQueryOptions, fetchAllAuditLogs, useAuditLogsQuery } from '@/hooks/useAuditLogsQuery';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';
import { resolveTheme } from '@/utils/chart-theme';
import { readServerSort } from '@/utils/data-table';
import { getAuditActionColor } from '@/utils/tag-colors';

type DateFormat = 'iso' | 'local';

type SortOrder = 'asc' | 'desc';

const INITIAL_PAGE = 1;

const INITIAL_SORT: { sortBy: $AuditLogsSortBy; sortOrder: SortOrder } = { sortBy: 'timestamp', sortOrder: 'desc' };

const isAuditedEntity = (entity: $AuditLogEntity): entity is AuditedEntity => Object.hasOwn(AUDITED_ACTIONS, entity);

const isAudited = (entity: AuditedEntity, action: $AuditLogAction) => {
  const actions: readonly $AuditLogAction[] = AUDITED_ACTIONS[entity];
  return actions.includes(action);
};

const ENTITIES = $AuditLogEntity.options.filter(isAuditedEntity).sort();

const ACTIONS = $AuditLogAction.options.filter((action) => ENTITIES.some((entity) => isAudited(entity, action)));

const actionsOn = (entity: AuditedEntity | undefined) => {
  return entity ? ACTIONS.filter((action) => isAudited(entity, action)) : ACTIONS;
};

/**
 * An old link or an edited URL can name an entity nothing writes, or an action never written on the
 * chosen entity. Either is dropped, so the page never filters by a value its menus cannot show or
 * clear.
 */
const $AuditedLogsSearchParams = $AuditLogsQuerySearchParams.transform(({ action, entity, ...search }) => {
  const auditedEntity = entity && isAuditedEntity(entity) ? entity : undefined;
  const auditedAction = action && actionsOn(auditedEntity).includes(action) ? action : undefined;
  return { ...search, action: auditedAction, entity: auditedEntity };
});

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
  const { action: selectedAction, entity: selectedEntity } = search;
  const availableActions = actionsOn(selectedEntity);
  const availableEntities = selectedAction ? ENTITIES.filter((entity) => isAudited(entity, selectedAction)) : ENTITIES;
  const hasFilters = Object.values(search).some((value) => value !== undefined);

  const localize = (value: $AuditLogAction | $AuditLogEntity) => t(`common.${snakeToCamelCase(toLowerCase(value))}`);

  return (
    <div className="flex flex-wrap items-center gap-2 pb-4" data-testid="audit-logs-toolbar">
      <FilterMenu
        allLabel={t({ en: 'All Groups', es: 'Todos los grupos', fr: 'Tous les groupes' })}
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
        allLabel={t({ en: 'All Users', es: 'Todos los usuarios', fr: 'Tous les utilisateurs' })}
        data-testid="audit-logs-filter-user"
        label={t('common.user')}
        options={availableUsers.map((user) => ({ label: user.username, value: user.id }))}
        value={search.userId}
        onValueChange={(userId) => setSearch({ userId })}
      />
      <FilterMenu
        allLabel={t({ en: 'Any Action', es: 'Cualquier acción', fr: 'Toute action' })}
        data-testid="audit-logs-filter-action"
        label={t('common.action')}
        options={availableActions.map((action) => ({ label: localize(action), value: action }))}
        value={search.action}
        onValueChange={(action) => setSearch({ action })}
      />
      <FilterMenu
        allLabel={t({ en: 'Any Entity', es: 'Cualquier entidad', fr: 'Toute entité' })}
        data-testid="audit-logs-filter-entity"
        label={t('common.entity')}
        options={availableEntities.map((entity) => ({ label: localize(entity), value: entity }))}
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
          {t({ en: 'Clear Filters', es: 'Borrar filtros', fr: 'Effacer les filtres' })}
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
  const [page, setPage] = useState(INITIAL_PAGE);
  const [sort, setSort] = useState(INITIAL_SORT);

  const auditLogsQuery = useAuditLogsQuery({ params: { ...search, page, ...sort } });
  // In server mode the table mounts with no sorting state of its own, so the column it is ordered by
  // is told its direction, or it would read as unsorted.
  const sortOrderOf = (sortBy: $AuditLogsSortBy) => (sort.sortBy === sortBy ? sort.sortOrder : undefined);

  const { resolvedLanguage, t } = useTranslation();
  const [theme] = useTheme();

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
          header: ({ column }) => (
            <div className="flex items-center gap-2">
              <SortableHeader column={column} label={t('common.time')} sortOrder={sortOrderOf('timestamp')} />
              <DateFormatMenu value={dateFormat} onChange={setDateFormat} />
            </div>
          ),
          size: 250,
          // The rows already arrive newest first, so the table's first toggle of its unsorted column
          // must go to ascending, or the first click would request the order already on screen.
          sortDescFirst: false
        },
        {
          accessorFn: (row) => row.user?.username ?? 'N/A',
          cell: (ctx) => {
            const value = ctx.getValue() as string;
            return <span className="overflow-hidden text-ellipsis whitespace-nowrap">{value}</span>;
          },
          header: ({ column }) => (
            <SortableHeader column={column} label={t('common.user')} sortOrder={sortOrderOf('user')} />
          ),
          id: 'user'
        },
        {
          accessorFn: (row) => row.group?.name ?? 'N/A',
          cell: (ctx) => {
            const value = ctx.getValue() as string;
            return <span className="overflow-hidden text-ellipsis whitespace-nowrap">{value}</span>;
          },
          header: ({ column }) => (
            <SortableHeader column={column} label={t('common.activeGroup')} sortOrder={sortOrderOf('group')} />
          ),
          id: 'group'
        },
        {
          accessorKey: 'action',
          cell: (ctx) => {
            const value = ctx.getValue() as $AuditLogAction;
            return (
              <ColorTagCell
                color={getAuditActionColor(value, resolveTheme(theme))}
                data-testid="audit-log-action"
                label={t(`common.${snakeToCamelCase(toLowerCase(value))}`)}
              />
            );
          },
          header: ({ column }) => (
            <SortableHeader column={column} label={t('common.action')} sortOrder={sortOrderOf('action')} />
          )
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
          header: ({ column }) => (
            <SortableHeader column={column} label={t('common.entity')} sortOrder={sortOrderOf('entity')} />
          )
        }
      ]}
      data={auditLogsQuery.data?.data ?? []}
      mode="server"
      pageCount={auditLogsQuery.data?.pageCount ?? 0}
      onPaginationChange={({ pageIndex }) => setPage(pageIndex + 1)}
      onSortingChange={(state) => {
        setSort(readServerSort(state, $AuditLogsSortBy.options));
        setPage(INITIAL_PAGE);
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
  // eslint-disable-next-line perfectionist/sort-objects -- TanStack Router infers the loader's `deps` from loaderDeps, so loaderDeps must come first
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        auditLogsQueryOptions({ params: { ...deps.search, page: INITIAL_PAGE, ...INITIAL_SORT } })
      ),
      context.queryClient.ensureQueryData(groupsQueryOptions()),
      context.queryClient.ensureQueryData(usersQueryOptions())
    ]);
  },
  validateSearch: $AuditedLogsSearchParams
});
