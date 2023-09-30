import { useState } from 'react';

import { ClientTable, Slider } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Assignment } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

export const SubjectManagementPage = () => {
  const { t } = useTranslation();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  return (
    <div>
      <div className="my-5">
        <h3 className="text-lg font-semibold">Assigned Instruments</h3>
      </div>
      <ClientTable<Assignment>
        columns={[
          {
            label: 'Title',
            field: 'title'
          },
          {
            label: 'Date Assigned',
            field: 'timeAssigned',
            formatter: (value: number) => toBasicISOString(new Date(value))
          },
          {
            label: 'Date Expires',
            field: 'timeExpires',
            formatter: (value: number) => toBasicISOString(new Date(value))
          },
          {
            label: 'Status',
            field: 'status',
            formatter: (value: string) => value.charAt(0) + value.slice(1).toLowerCase()
          }
        ]}
        data={[
          {
            title: 'SANS',
            timeAssigned: Date.now(),
            timeExpires: Date.now() + 100000,
            status: 'CANCELED'
          }
        ]}
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
    </div>
  );
};

export default SubjectManagementPage;
