import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Card, Checkbox, DataTable, Dialog } from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon, CircleAlertIcon, CircleDotIcon } from 'lucide-react';

import { useAssignmentsQuery } from '@/hooks/useAssignmentsQuery';
import { useDeleteBulkAssignmentsMutation } from '@/hooks/useDeleteBulkAssignmentsMutation';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';

type AssignmentRow = {
  createdAt: string;
  expiresAt: string;
  id: string;
  instrument: string;
  status: 'EXPIRED' | 'OUTSTANDING';
  subject: string;
};

const SortableHeader = ({ column, label }: { column: TanstackTable.Column<AssignmentRow>; label: string }) => {
  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ChevronUpIcon : sorted === 'desc' ? ChevronDownIcon : ChevronsUpDownIcon;
  return (
    <button
      className="hover:text-foreground flex items-center gap-1 transition-colors"
      type="button"
      onClick={() => column.toggleSorting()}
    >
      {label}
      <Icon className={cn('h-3.5 w-3.5', !sorted && 'opacity-40')} />
    </button>
  );
};

const StatusCell = ({ status }: { status: 'EXPIRED' | 'OUTSTANDING' }) => {
  const { t } = useTranslation();
  if (status === 'OUTSTANDING') {
    return (
      <span className="flex items-center gap-1.5">
        <CircleDotIcon className="h-3.5 w-3.5 text-sky-600" />
        {t({ en: 'Outstanding', es: 'Pendiente', fr: 'En attente' })}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <CircleAlertIcon className="h-3.5 w-3.5 text-amber-500" />
      {t({ en: 'Expired', es: 'Expirado', fr: 'Expiré' })}
    </span>
  );
};

export type DeleteRemoteAssignmentsProps = {
  groupId: string;
  onBack?: () => void;
  subjectIdDisplayLength: number;
};

export const DeleteRemoteAssignments = ({ groupId, onBack, subjectIdDisplayLength }: DeleteRemoteAssignmentsProps) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const assignmentsQuery = useAssignmentsQuery({ params: { groupId } });
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const deleteMutation = useDeleteBulkAssignmentsMutation();

  const instrumentMap = new Map<string, UnilingualInstrumentInfo>(
    (instrumentInfoQuery.data ?? []).map((info) => [info.id, info])
  );

  const deletableAssignments = (assignmentsQuery.data ?? []).filter(
    (a): a is Assignment & { status: 'EXPIRED' | 'OUTSTANDING' } => a.status === 'OUTSTANDING' || a.status === 'EXPIRED'
  );

  const rows: AssignmentRow[] = deletableAssignments.map((assignment) => ({
    createdAt: toBasicISOString(assignment.createdAt),
    expiresAt: toBasicISOString(assignment.expiresAt),
    id: assignment.id,
    instrument: instrumentMap.get(assignment.instrumentId)?.details.title ?? assignment.instrumentId,
    status: assignment.status,
    subject: removeSubjectIdScope(assignment.subjectId).slice(0, subjectIdDisplayLength)
  }));

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleFiltered = (filteredRows: AssignmentRow[]) => {
    const allSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedIds.has(row.id));
    const next = new Set(selectedIds);
    for (const row of filteredRows) {
      if (allSelected) {
        next.delete(row.id);
      } else {
        next.add(row.id);
      }
    }
    setSelectedIds(next);
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { ids: [...selectedIds] },
      {
        onSuccess() {
          setSelectedIds(new Set());
          setIsConfirmOpen(false);
          onBack?.();
        }
      }
    );
  };

  return (
    <Card className="overflow-hidden" data-testid="delete-remote-assignments">
      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <Card.Title className="text-lg">
            {t({ en: 'Delete Assignments', es: 'Eliminar tareas', fr: 'Supprimer des tâches' })}
          </Card.Title>
          <Card.Description>
            {t({
              en: 'Select outstanding or expired assignments to delete.',
              es: 'Seleccione las tareas pendientes o expiradas para eliminar.',
              fr: 'Sélectionnez les tâches en attente ou expirées à supprimer.'
            })}
          </Card.Description>
        </div>

        {rows.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm italic">
            {t({
              en: 'No outstanding or expired assignments in this group.',
              es: 'No hay tareas pendientes o expiradas en este grupo.',
              fr: 'Aucune tâche en attente ou expirée dans ce groupe.'
            })}
          </p>
        ) : (
          <DataTable
            columns={[
              {
                cell: ({ row }) => (
                  <Checkbox
                    aria-label={row.original.subject}
                    checked={selectedIds.has(row.original.id)}
                    data-testid={`delete-select-assignment-${row.original.id}`}
                    onCheckedChange={() => toggle(row.original.id)}
                  />
                ),
                enableSorting: false,
                header: ({ table }) => {
                  const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original);
                  const allFilteredSelected =
                    filteredRows.length > 0 && filteredRows.every((row) => selectedIds.has(row.id));
                  return (
                    <Checkbox
                      aria-label={t({
                        en: 'Select All Shown',
                        es: 'Seleccionar todo lo mostrado',
                        fr: 'Tout sélectionner'
                      })}
                      checked={allFilteredSelected}
                      data-testid="delete-select-all-assignments"
                      onCheckedChange={() => toggleFiltered(filteredRows)}
                    />
                  );
                },
                id: 'select',
                maxSize: 40,
                size: 40
              },
              {
                accessorKey: 'subject',
                header: ({ column }) => <SortableHeader column={column} label={t('datahub.index.table.subject')} />,
                id: 'subject'
              },
              {
                accessorKey: 'instrument',
                cell: ({ getValue }) => {
                  const value = getValue<string>();
                  return (
                    <span className="block truncate" title={value}>
                      {value}
                    </span>
                  );
                },
                header: ({ column }) => (
                  <SortableHeader
                    column={column}
                    label={t({ en: 'Instrument', es: 'Instrumento', fr: 'Instrument' })}
                  />
                ),
                id: 'instrument',
                minSize: 400,
                size: 500
              },
              {
                accessorKey: 'createdAt',
                header: ({ column }) => (
                  <SortableHeader column={column} label={t({ en: 'Assigned', es: 'Asignado', fr: 'Attribué' })} />
                ),
                id: 'createdAt',
                maxSize: 110,
                size: 110
              },
              {
                accessorKey: 'expiresAt',
                header: ({ column }) => (
                  <SortableHeader column={column} label={t({ en: 'Expires', es: 'Expira', fr: 'Expire' })} />
                ),
                id: 'expiresAt',
                maxSize: 110,
                size: 110
              },
              {
                accessorKey: 'status',
                cell: ({ getValue }) => <StatusCell status={getValue<'EXPIRED' | 'OUTSTANDING'>()} />,
                header: ({ column }) => (
                  <SortableHeader column={column} label={t({ en: 'Status', es: 'Estado', fr: 'Statut' })} />
                ),
                id: 'status',
                maxSize: 130,
                size: 130
              }
            ]}
            data={rows}
            rootStyle={{ '--color-background': 'var(--color-card)' }}
            onRowClick={(row) => toggle(row.id)}
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-3">
        {onBack && (
          <Button className="mr-auto" type="button" variant="outline" onClick={onBack}>
            {t({ en: 'Back', es: 'Volver', fr: 'Retour' })}
          </Button>
        )}
        {rows.length > 0 && (
          <Button
            data-testid="delete-selected-assignments"
            disabled={selectedIds.size === 0}
            type="button"
            variant="danger"
            onClick={() => setIsConfirmOpen(true)}
          >
            {t({ en: 'Delete Selected', es: 'Eliminar selección', fr: 'Supprimer la sélection' })}
            {selectedIds.size > 0 && ` (${selectedIds.size})`}
          </Button>
        )}
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {t({ en: 'Delete Assignments', es: 'Eliminar tareas', fr: 'Supprimer des tâches' })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: `Delete ${selectedIds.size} assignment${selectedIds.size === 1 ? '' : 's'}? This cannot be undone.`,
                es: `¿Eliminar ${selectedIds.size} tarea${selectedIds.size === 1 ? '' : 's'}? Esta acción no se puede deshacer.`,
                fr: `Supprimer ${selectedIds.size} tâche${selectedIds.size === 1 ? '' : 's'} ? Cette action est irréversible.`
              })}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>
              {t({ en: 'Cancel', es: 'Cancelar', fr: 'Annuler' })}
            </Button>
            <Button
              data-testid="confirm-delete-assignments"
              disabled={deleteMutation.isPending}
              type="button"
              variant="danger"
              onClick={handleDelete}
            >
              {deleteMutation.isPending
                ? t({ en: 'Deleting…', es: 'Eliminando…', fr: 'Suppression…' })
                : t({ en: 'Delete', es: 'Eliminar', fr: 'Supprimer' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </Card>
  );
};
