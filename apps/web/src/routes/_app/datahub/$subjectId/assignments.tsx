// Assignment creation has been moved to the dedicated remote assignment page (/session/remote-assignment).
// This page now only displays existing assignments and allows viewing/canceling them.

import React, { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Heading, Input, Label, Sheet, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CopyButton } from '@opendatacapture/react-core';
import type { Assignment, AssignmentStatus } from '@opendatacapture/schemas/assignment';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { createFileRoute } from '@tanstack/react-router';

import { QRCode } from '@/components/QRCode';
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
            className="w-full whitespace-nowrap text-sm"
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
  const [instruments, setInstruments] = useState<{ [key: string]: UnilingualInstrumentInfo }>({});

  const instrumentInfoQuery = useInstrumentInfoQuery();

  useEffect(() => {
    setInstruments(
      Object.fromEntries((instrumentInfoQuery.data ?? []).map((instrument) => [instrument.id, instrument]))
    );
  }, [instrumentInfoQuery.data]);

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

  return (
    <div className="bg-card text-muted-foreground shadow-xs rounded-md border tracking-tight">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="text-foreground whitespace-nowrap">{t('assignments.title')}</Table.Head>
            <Table.Head className="text-foreground whitespace-nowrap">{t('assignments.assignedAt')}</Table.Head>
            <Table.Head className="text-foreground whitespace-nowrap">{t('assignments.expiresAt')}</Table.Head>
            <Table.Head className="text-foreground whitespace-nowrap">{t('assignments.status')}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {assignments.map((assignment) => (
            <Table.Row
              className="cursor-pointer"
              data-state={selectedId === assignment.id ? 'selected' : undefined}
              key={assignment.id}
              onClick={() => onSelection(assignment)}
            >
              <Table.Cell>{instruments[assignment.instrumentId]?.details.title ?? assignment.instrumentId}</Table.Cell>
              <Table.Cell>{toBasicISOString(assignment.createdAt)}</Table.Cell>
              <Table.Cell>{toBasicISOString(assignment.expiresAt)}</Table.Cell>
              <Table.Cell>{formatStatus(assignment.status)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
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

export const Route = createFileRoute('/_app/datahub/$subjectId/assignments')({
  component: RouteComponent
});
