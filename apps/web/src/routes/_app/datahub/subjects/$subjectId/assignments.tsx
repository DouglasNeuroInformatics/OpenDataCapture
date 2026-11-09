// Assignment creation has been moved to the dedicated remote assignment page (/session/remote-assignment).
// This page now only displays existing assignments and allows viewing/canceling them.

import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, Heading, Input, Label, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CopyButton } from '@opendatacapture/react-core';
import type { Assignment, AssignmentStatus } from '@opendatacapture/schemas/assignment';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { AssignmentEmailForm } from '@/components/AssignmentEmailForm';
import { QRCode } from '@/components/QRCode';
import { SortableHeader } from '@/components/SortableHeader';
import { config } from '@/config';
import { useAssignmentsQuery } from '@/hooks/useAssignmentsQuery';
import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useUpdateAssignment } from '@/hooks/useUpdateAssignment';

const AssignmentSlider: React.FC<{
  assignment: Assignment | null;
  isOpen: boolean;
  onCancel: (assignment: Assignment) => void;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ assignment, isOpen, onCancel, setIsOpen }) => {
  const { t } = useTranslation();
  const instrument = useInstrument(assignment?.instrumentId ?? null);
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const instrumentLanguages = instrumentInfoQuery.data?.find(
    (i) => i.id === assignment?.instrumentId
  )?.supportedLanguages;

  return (
    <Sheet open={Boolean(isOpen && assignment && instrument)} onOpenChange={setIsOpen}>
      <Sheet.Content className="flex h-full flex-col">
        <Sheet.Header>
          <Sheet.Title>{instrument?.details.title}</Sheet.Title>
          <Sheet.Description>{t('datahub.assignments.assignmentSliderDesc')}</Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="grow">
          <div className="flex flex-col gap-3">
            <Label asChild>
              <a className="hover:underline" href={assignment?.url} rel="noreferrer" target="_blank">
                {t('datahub.assignments.link')}
              </a>
            </Label>
            <div className="flex gap-2">
              <Input readOnly className="h-9" id="link" value={assignment?.url} />
              <CopyButton size="sm" text={assignment?.url ?? ''} variant="outline" />
            </div>
            <QRCode url={assignment?.url ?? 'javascript:void(0)'} />
            {/* Only an outstanding assignment can still be completed, so only it is worth emailing.
                Keyed per assignment: the sheet is reused across selections, and a template chosen
                for one assignment must not silently carry over to the next one opened. */}
            {assignment?.status === 'OUTSTANDING' && (
              <AssignmentEmailForm
                assignment={assignment}
                instrumentLanguages={instrumentLanguages}
                key={assignment.id}
              />
            )}
          </div>
        </Sheet.Body>
        <Sheet.Footer>
          <Button
            className="w-full text-sm"
            disabled={assignment?.status !== 'OUTSTANDING'}
            label={t('core.cancel')}
            variant="danger"
            onClick={() => onCancel(assignment!)}
          />
          <Button
            disabled
            className="w-full text-sm whitespace-nowrap"
            label={t('datahub.assignments.resendNotification')}
            variant="secondary"
          />
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
};

const AssignmentsTable: React.FC<{
  assignments: Assignment[];
  onSelection: (assignment: Assignment) => void;
  selectedId: null | string;
}> = ({ assignments, onSelection, selectedId }) => {
  const { t } = useTranslation('datahub');
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const instruments = new Map((instrumentInfoQuery.data ?? []).map((instrument) => [instrument.id, instrument]));

  const formatStatus = (status: AssignmentStatus) => {
    switch (status) {
      case 'CANCELED':
        return t('assignments.statusOptions.canceled');
      case 'COMPLETE':
        return t('assignments.statusOptions.complete');
      case 'EXPIRED':
        return t('assignments.statusOptions.expired');
      case 'OUTSTANDING':
        return t('assignments.statusOptions.outstanding');
    }
  };

  // Tanstack caches a column's value on the row object, so a value that depends on a separately
  // loaded query has to be in the row, or the sort would keep what it read before the query settled.
  const rows = assignments.map((assignment) => ({
    ...assignment,
    instrumentTitle: instruments.get(assignment.instrumentId)?.details.title ?? assignment.instrumentId,
    statusLabel: formatStatus(assignment.status)
  }));

  return (
    <DataTable
      disableSearch
      columns={[
        {
          accessorKey: 'instrumentTitle',
          cell: (ctx) => (
            <span className="flex items-center">
              {ctx.getValue<string>()}
              <span
                className="hidden"
                data-row-selected={selectedId === ctx.row.original.id ? 'true' : 'false'}
                data-testid="assignment-row-selection"
              />
            </span>
          ),
          header: ({ column }) => <SortableHeader column={column} label={t('assignments.title')} />
        },
        {
          accessorKey: 'createdAt',
          cell: (ctx) => toBasicISOString(ctx.getValue<Date>()),
          header: ({ column }) => <SortableHeader column={column} label={t('assignments.assignedAt')} />
        },
        {
          accessorKey: 'expiresAt',
          cell: (ctx) => toBasicISOString(ctx.getValue<Date>()),
          header: ({ column }) => <SortableHeader column={column} label={t('assignments.expiresAt')} />
        },
        {
          accessorKey: 'statusLabel',
          header: ({ column }) => <SortableHeader column={column} label={t('assignments.status')} />
        }
      ]}
      data={rows}
      onRowClick={onSelection}
    />
  );
};

const RouteComponent = () => {
  const params = Route.useParams();
  const { t } = useTranslation();
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const assignmentsQuery = useAssignmentsQuery({ params: { subjectId: params.subjectId } });
  const updateAssignmentMutation = useUpdateAssignment();

  return (
    <div>
      <div className="mb-5 flex flex-col items-center justify-start gap-2 md:justify-between lg:flex-row">
        <Heading variant="h4">{t('datahub.assignments.assignedInstruments')}</Heading>
      </div>
      <AssignmentsTable
        assignments={assignmentsQuery.data ?? []}
        selectedId={selectedAssignment?.id ?? null}
        onSelection={(assignment) => {
          setSelectedAssignment(assignment);
          setIsEditSliderOpen(true);
        }}
      />
      <AssignmentSlider
        assignment={selectedAssignment}
        isOpen={isEditSliderOpen}
        setIsOpen={setIsEditSliderOpen}
        onCancel={({ id }) => {
          updateAssignmentMutation.mutate({ data: { status: 'CANCELED' }, params: { id } });
          setIsEditSliderOpen(false);
        }}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/subjects/$subjectId/assignments')({
  beforeLoad: ({ params }) => {
    if (!config.setup.isGatewayEnabled) {
      throw redirect({ params, to: '/datahub/subjects/$subjectId/table' });
    }
  },
  component: RouteComponent
});
