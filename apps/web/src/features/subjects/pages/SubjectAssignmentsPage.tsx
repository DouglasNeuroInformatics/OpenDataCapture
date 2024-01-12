import { useMemo, useState } from 'react';

import { Button } from '@douglasneuroinformatics/ui';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { Assignment } from '@open-data-capture/common/assignment';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAssignments } from '@/hooks/useAssignments';
import { useAvailableForms } from '@/hooks/useAvailableForms';
import { useCreateAssignment } from '@/hooks/useCreateAssignment';
import { useUpdateAssignment } from '@/hooks/useUpdateAssignment';

import { AssignmentModal } from '../components/AssignmentModal';
import { AssignmentSlider } from '../components/AssignmentSlider';
import { AssignmentsTable } from '../components/AssignmentsTable';

export const SubjectAssignmentsPage = () => {
  const params = useParams();
  const { i18n, t } = useTranslation('subjects');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const assignmentsQuery = useAssignments({ params: { subjectId: params.subjectId } });
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();

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
          updateAssignmentMutation.mutate({ data: { status: 'CANCELED' }, params: { id } });
          setIsEditSliderOpen(false);
        }}
      />
      <AssignmentModal
        instrumentOptions={instrumentOptions}
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        onSubmit={(data) => {
          createAssignmentMutation.mutate({ data: { ...data, subjectId: params.subjectId! } });
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};
