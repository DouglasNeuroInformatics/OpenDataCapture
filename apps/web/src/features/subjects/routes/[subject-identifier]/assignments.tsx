import { useState } from 'react';

import { Button, ClientTable } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Assignment } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { HiPlus } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { useFetch } from '@/hooks/useFetch';

import { AssignmentModal } from '../../components/AssignmentModal';
import { AssignmentSlider } from '../../components/AssignmentSlider';

export const AssignmentsPage = () => {
  const params = useParams();
  const { t } = useTranslation('subjects');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditSliderOpen, setIsEditSliderOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const { data } = useFetch<Assignment[]>('/v1/assignments', [isCreateModalOpen, isEditSliderOpen]);

  if (!data) {
    return null;
  }

  return (
    <div>
      <div className="my-5 flex flex-col items-center justify-start gap-2 md:justify-between lg:flex-row">
        <h3 className="text-lg font-semibold">{t('subjectManagementPage.assignedInstruments')}</h3>
        <Button
          className="w-full text-sm lg:w-auto"
          icon={<HiPlus />}
          iconPosition="right"
          label={t('subjectManagementPage.addAssignment')}
          variant="secondary"
          onClick={() => setIsCreateModalOpen(true)}
        />
      </div>
      <ClientTable<Assignment>
        columns={[
          {
            field: (entry) => entry.instrument.details.title,
            label: t('subjectManagementPage.tableColumns.title')
          },
          {
            field: 'timeAssigned',
            formatter: (value: number) => toBasicISOString(new Date(value)),
            label: t('subjectManagementPage.tableColumns.timeAssigned')
          },
          {
            field: 'timeExpires',
            formatter: (value: number) => toBasicISOString(new Date(value)),
            label: t('subjectManagementPage.tableColumns.timeExpires')
          },
          {
            field: 'status',
            formatter: (value: string) => value.charAt(0) + value.slice(1).toLowerCase(),
            label: t('subjectManagementPage.tableColumns.status')
          }
        ]}
        data={data}
        onEntryClick={(assignment) => {
          setSelectedAssignment(assignment);
          setIsEditSliderOpen(true);
        }}
      />
      <AssignmentSlider assignment={selectedAssignment} isOpen={isEditSliderOpen} setIsOpen={setIsEditSliderOpen} />
      <AssignmentModal
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        subjectIdentifier={params.subjectIdentifier!}
      />
    </div>
  );
};

