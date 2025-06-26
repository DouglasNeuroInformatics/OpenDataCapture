/* eslint-disable perfectionist/sort-objects */

import { useState } from 'react';

import { Button, Dialog, Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { Assignment, CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import { useParams } from 'react-router-dom';
import { z } from 'zod/v4';

import { useAssignmentsQuery } from '@/hooks/useAssignmentsQuery';
import { useCreateAssignment } from '@/hooks/useCreateAssignment';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useUpdateAssignment } from '@/hooks/useUpdateAssignment';
import { useAppStore } from '@/store';

import { AssignmentSlider } from '../components/AssignmentSlider';
import { AssignmentsTable } from '../components/AssignmentsTable';

const ONE_YEAR = 31556952000;

export const SubjectAssignmentsPage = () => {
  const params = useParams();
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
                data: { ...data, groupId: currentGroup?.id, subjectId: params.subjectId! }
              });
              setIsCreateModalOpen(false);
            }}
          />
        </Dialog.Content>
      </div>
    </Dialog>
  );
};
