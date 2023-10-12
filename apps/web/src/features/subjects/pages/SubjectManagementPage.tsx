import { useState } from 'react';

import { Button, ClientTable, Slider } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Assignment } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { HiPlus } from 'react-icons/hi2';

import { useFetch } from '@/hooks/useFetch';

import { AssignmentModal } from '../components/AssignmentModal';

export const SubjectManagementPage = () => {
  const { t } = useTranslation('subjects');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const { data } = useFetch<Assignment[]>('/v1/assignments', [isCreateModalOpen]);

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
            field: 'title',
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
        onEntryClick={setSelectedAssignment}
      />
      <Slider
        isOpen={selectedAssignment !== null}
        setIsOpen={() => {
          setSelectedAssignment(null);
        }}
        title={selectedAssignment?.title}
      >
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deserunt architecto libero incidunt, quaerat quidem
        numquam voluptatum repellendus soluta harum nulla! Consequuntur sunt laudantium praesentium iure possimus soluta
        et alias tempora?
      </Slider>

      <AssignmentModal isOpen={isCreateModalOpen} setIsOpen={setIsCreateModalOpen} />
    </div>
  );
};

export default SubjectManagementPage;
