import { useMemo, useState } from 'react';

import { Button, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { PlusIcon } from '@heroicons/react/24/solid';
import { assignmentSummarySchema } from '@open-data-capture/common/assignment';
import type {
  AssignmentSummary,
  CreateAssignmentData,
  UpdateAssignmentData
} from '@open-data-capture/common/assignment';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAvailableForms } from '@/hooks/useAvailableForms';

import { AssignmentModal } from '../components/AssignmentModal';
import { AssignmentSlider } from '../components/AssignmentSlider';
import { AssignmentsTable } from '../components/AssignmentsTable';

type AssignmentMutationOptions =
  | {
      id: string;
      kind: 'update';
      payload: UpdateAssignmentData;
    }
  | {
      kind: 'create';
      payload: Omit<CreateAssignmentData, 'subjectIdentifier'>;
    };

export const SubjectAssignmentsPage = () => {
  const params = useParams();
  const { i18n, t } = useTranslation('subjects');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false);
  const notifications = useNotificationsStore();

  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentSummary | null>(null);

  const assignmentsQuery = useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/assignments/summary', {
        params: {
          subjectIdentifier: params.subjectIdentifier
        }
      });
      return assignmentSummarySchema.array().parse(response.data);
    },
    queryKey: ['assignments', params.subjectIdentifier]
  });
  const assignmentsMutation = useMutation({
    mutationFn: async (data: AssignmentMutationOptions) => {
      if (data.kind === 'create') {
        await axios.post('/v1/assignments', { ...data.payload, subjectIdentifier: params.subjectIdentifier! });
      } else if (data.kind === 'update') {
        await axios.patch(`/v1/assignments/${data.id}`, data.payload);
      }
      notifications.addNotification({ type: 'success' });
      return assignmentsQuery.refetch();
    }
  });
  const forms = useAvailableForms();

  const instrumentOptions: Record<string, string> = useMemo(() => {
    if (!forms.data) {
      return {};
    }
    const options: Record<string, string> = {};
    for (const form of forms.data) {
      if (!form.id) {
        console.error('Form ID does not exist');
        continue;
      }
      options[form.id] = form.details.title;
    }
    return options;
  }, [forms.data, i18n.resolvedLanguage]);

  if (!(assignmentsQuery.data && forms.data)) {
    return null;
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-center justify-start gap-2 md:justify-between lg:flex-row">
        <h3 className="text-lg font-semibold">{t('assignments.assignedInstruments')}</h3>
        <Button
          className="w-full text-sm lg:w-auto"
          icon={<PlusIcon />}
          iconPosition="right"
          label={t('assignments.addAssignment')}
          size="sm"
          variant="secondary"
          onClick={() => setIsCreateModalOpen(true)}
        />
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
          assignmentsMutation.mutate({ id: id!.toString(), kind: 'update', payload: { status: 'CANCELED' } });
          setIsEditSliderOpen(false);
        }}
      />
      <AssignmentModal
        instrumentOptions={instrumentOptions}
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        onSubmit={(data) => {
          assignmentsMutation.mutate({ kind: 'create', payload: data });
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};
