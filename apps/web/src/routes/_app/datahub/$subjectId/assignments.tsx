/* eslint-disable perfectionist/sort-objects */

import React, { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  Button,
  ClientTable,
  Dialog,
  Form,
  Heading,
  Input,
  Label,
  Sheet
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { PlusIcon } from '@heroicons/react/24/solid';
import { CopyButton } from '@opendatacapture/react-core';
import type { Assignment, AssignmentStatus, CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { useAssignmentsQuery } from '@/hooks/useAssignmentsQuery';
import { useCreateAssignment } from '@/hooks/useCreateAssignment';
import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useUpdateAssignment } from '@/hooks/useUpdateAssignment';
import { useAppStore } from '@/store';

const ONE_YEAR = 31556952000;

const AssignmentSlider: React.FC<{
  assignment: Assignment | null;
  isOpen: boolean;
  onCancel: (assignment: Assignment) => void;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ assignment, isOpen, onCancel, setIsOpen }) => {
  const { t } = useTranslation();
  const instrument = useInstrument(assignment?.instrumentId ?? null);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Sheet.Content className="flex h-full flex-col">
        <Sheet.Header>
          <Sheet.Title>{instrument?.details.title}</Sheet.Title>
          <Sheet.Description>{t('datahub.assignments.assignmentSliderDesc')}</Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="grow">
          {instrument && (
            <div className="flex flex-col gap-3">
              <Label asChild>
                <a className="hover:underline" href={assignment!.url} rel="noreferrer" target="_blank">
                  {t('datahub.assignments.link')}
                </a>
              </Label>
              <div className="flex gap-2">
                <Input readOnly className="h-9" id="link" value={assignment!.url} />
                <CopyButton size="sm" text={assignment!.url} variant="outline" />
              </div>
            </div>
          )}
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
}> = ({ assignments, onSelection }) => {
  const { t } = useTranslation('datahub');
  const [instruments, setInstruments] = useState<{ [key: string]: UnilingualInstrumentInfo }>({});

  const instrumentInfoQuery = useInstrumentInfoQuery();

  useEffect(() => {
    setInstruments(
      Object.fromEntries((instrumentInfoQuery.data ?? []).map((instrument) => [instrument.id, instrument]))
    );
  }, [instrumentInfoQuery.data]);

  return (
    <ClientTable<Assignment>
      columns={[
        {
          field: (entry) => {
            return instruments[entry.instrumentId]?.details.title ?? entry.instrumentId;
          },
          label: t('assignments.title')
        },
        {
          field: 'createdAt',
          formatter: (value: Date) => toBasicISOString(value),
          label: t('assignments.assignedAt')
        },
        {
          field: 'expiresAt',
          formatter: (value: Date) => toBasicISOString(value),
          label: t('assignments.expiresAt')
        },
        {
          field: 'status',
          formatter: (value: AssignmentStatus) => {
            switch (value) {
              case 'CANCELED':
                return t('assignments.statusOptions.canceled');
              case 'COMPLETE':
                return t('assignments.statusOptions.complete');
              case 'EXPIRED':
                return t('assignments.statusOptions.expired');
              case 'OUTSTANDING':
                return t('assignments.statusOptions.outstanding');
            }
          },
          label: t('assignments.status')
        }
      ]}
      data={assignments}
      entriesPerPage={15}
      minRows={15}
      onEntryClick={onSelection}
    />
  );
};

const RouteComponent = () => {
  const params = Route.useParams();
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false);
  const currentGroup = useAppStore((store) => store.currentGroup);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const assignmentsQuery = useAssignmentsQuery({ params: { subjectId: params.subjectId } });
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();

  const instrumentInfoQuery = useInstrumentInfoQuery();

  const instrumentOptions = Object.fromEntries(
    (instrumentInfoQuery.data ?? [])
      .sort((a, b) => a.details.title.localeCompare(b.details.title))
      .filter((instrument) => {
        return currentGroup?.accessibleInstrumentIds.includes(instrument.id) ?? true;
      })
      .map((instrument) => [instrument.id, instrument.details.title])
  );

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <div>
        <div className="mb-5 flex flex-col items-center justify-start gap-2 md:justify-between lg:flex-row">
          <Heading variant="h4">{t('datahub.assignments.assignedInstruments')}</Heading>
          <Dialog.Trigger asChild>
            <Button variant="outline">
              {t('datahub.assignments.addAssignment')}
              <PlusIcon />
            </Button>
          </Dialog.Trigger>
        </div>
        <AssignmentsTable
          assignments={assignmentsQuery.data ?? []}
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
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t('datahub.assignments.addAssignment')}</Dialog.Title>
            <Dialog.Description>{t('datahub.assignments.addAssignmentDesc')}</Dialog.Description>
          </Dialog.Header>
          <Form
            suspendWhileSubmitting
            content={{
              instrumentId: {
                kind: 'string',
                label: t('core.instrument'),
                options: instrumentOptions,
                variant: 'select'
              },
              expiresAt: {
                kind: 'date',
                label: t('datahub.assignments.expiresAt')
              }
            }}
            initialValues={{
              expiresAt: new Date(Date.now() + ONE_YEAR)
            }}
            validationSchema={
              z.object({
                expiresAt: z.coerce.date().min(new Date(), { message: t('datahub.errors.expiryMustBeInFuture') }),
                instrumentId: z.string()
              }) satisfies z.ZodType<Omit<CreateAssignmentData, 'subjectId'>>
            }
            onSubmit={async (data) => {
              await createAssignmentMutation.mutateAsync({
                data: { ...data, groupId: currentGroup?.id, subjectId: params.subjectId }
              });
              setIsCreateModalOpen(false);
            }}
          />
        </Dialog.Content>
      </div>
    </Dialog>
  );
};

export const Route = createFileRoute('/_app/datahub/$subjectId/assignments')({
  component: RouteComponent
});
