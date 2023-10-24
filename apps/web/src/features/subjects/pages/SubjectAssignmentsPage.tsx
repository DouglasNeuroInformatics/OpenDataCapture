import { useMemo, useState } from 'react';

import { Button, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { assignmentSummarySchema } from '@open-data-capture/schemas/assignment';
import type { AssignmentSummary, Language } from '@open-data-capture/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { HiPlus } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { useAvailableForms } from '@/hooks/useAvailableForms';

import { AssignmentModal } from '../components/AssignmentModal';
import { AssignmentSlider } from '../components/AssignmentSlider';
import { AssignmentsTable } from '../components/AssignmentsTable';

export const SubjectAssignmentsPage = () => {
  const params = useParams();
  const { i18n, t } = useTranslation('subjects');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false);
  const notifications = useNotificationsStore();

  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentSummary | null>(null);

  const formsQuery = useAvailableForms();
  const assignmentsQuery = useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/assignments/summary');
      return assignmentSummarySchema.array().parse(response.data);
    },
    queryKey: ['assignments']
  });

  const instrumentOptions: Record<string, string> = useMemo(() => {
    if (!formsQuery.data) {
      return {};
    }
    const options: Record<string, string> = {};
    for (const form of formsQuery.data) {
      if (!form.id) {
        console.error('Form ID does not exist');
        continue;
      } else if (typeof form.details.title === 'string') {
        options[form.id] = form.details.title;
      } else {
        options[form.id] = form.details.title[i18n.resolvedLanguage as Language] ?? form.name;
      }
    }
    return options;
  }, [formsQuery.data, i18n.resolvedLanguage]);

  if (!(assignmentsQuery.data && formsQuery.data)) {
    return null;
  }

  return (
    <div>
      <div className="my-5 flex flex-col items-center justify-start gap-2 md:justify-between lg:flex-row">
        <h3 className="text-lg font-semibold">{t('assignments.assignedInstruments')}</h3>
        <Button
          className="w-full text-sm lg:w-auto"
          icon={<HiPlus />}
          iconPosition="right"
          label={t('assignments.addAssignment')}
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
      <AssignmentSlider assignment={selectedAssignment} isOpen={isEditSliderOpen} setIsOpen={setIsEditSliderOpen} />
      <AssignmentModal
        instrumentOptions={instrumentOptions}
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        onSubmit={(data) => {
          axios
            .post('/v1/assignments', { ...data, subjectIdentifier: params.subjectIdentifier })
            .then(() => {
              notifications.addNotification({ type: 'success' });
              setIsCreateModalOpen(false);
              return assignmentsQuery.refetch();
            })
            .catch(console.error);
        }}
      />
    </div>
  );
};
