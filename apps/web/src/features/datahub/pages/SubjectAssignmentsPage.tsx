/* eslint-disable perfectionist/sort-objects */

import React, { useState } from 'react';

import { Button, Dialog, Form, Heading } from '@douglasneuroinformatics/libui/components';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { Assignment, CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { useAssignmentsQuery } from '@/hooks/useAssignmentsQuery';
import { useCreateAssignment } from '@/hooks/useCreateAssignment';
import { useInstrumentSummariesQuery } from '@/hooks/useInstrumentSummariesQuery';
import { useUpdateAssignment } from '@/hooks/useUpdateAssignment';

import { AssignmentSlider } from '../components/AssignmentSlider';
import { AssignmentsTable } from '../components/AssignmentsTable';

const ONE_YEAR = 31556952000;

export const SubjectAssignmentsPage = () => {
  const params = useParams();
  const { t } = useTranslation(['datahub', 'core']);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const assignmentsQuery = useAssignmentsQuery({ params: { subjectId: params.subjectId } });
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();

  const instrumentSummariesQuery = useInstrumentSummariesQuery();

  const instrumentOptions = Object.fromEntries(
    instrumentSummariesQuery.data.map((instrument) => [instrument.id, instrument.details.title])
  );

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <div>
        <div className="mb-5 flex flex-col items-center justify-start gap-2 md:justify-between lg:flex-row">
          <Heading variant="h4">{t('assignments.assignedInstruments')}</Heading>
          <Dialog.Trigger>
            <Button variant="outline">
              {t('assignments.addAssignment')}
              <PlusIcon />
            </Button>
          </Dialog.Trigger>
        </div>
        <AssignmentsTable
          assignments={assignmentsQuery.data}
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
            <Dialog.Title>{t('assignments.addAssignment')}</Dialog.Title>
            <Dialog.Description>{t('assignments.addAssignmentDesc')}</Dialog.Description>
          </Dialog.Header>
          <Form
            content={{
              instrumentId: {
                kind: 'string',
                label: t('core:instrument'),
                options: instrumentOptions,
                variant: 'select'
              },
              expiresAt: {
                kind: 'date',
                label: t('assignments.expiresAt')
              }
            }}
            initialValues={{
              expiresAt: new Date(Date.now() + ONE_YEAR)
            }}
            validationSchema={
              z.object({
                expiresAt: z.coerce.date().min(new Date(), { message: t('errors.expiryMustBeInFuture') }),
                instrumentId: z.string()
              }) satisfies z.ZodType<Omit<CreateAssignmentData, 'subjectId'>>
            }
            onSubmit={(data) => {
              createAssignmentMutation.mutate({ data: { ...data, subjectId: params.subjectId! } });
              setIsCreateModalOpen(false);
            }}
          />
        </Dialog.Content>
      </div>
    </Dialog>
  );
};
