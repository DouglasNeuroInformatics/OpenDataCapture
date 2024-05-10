import React from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ClientTable } from '@douglasneuroinformatics/libui/components';
import type { Subject } from '@opendatacapture/schemas/subject';
import { useTranslation } from 'react-i18next';

export type MasterDataTableProps = {
  data: Subject[];
  onSelect: (subject: Subject) => void;
};

export const MasterDataTable = ({ data, onSelect }: MasterDataTableProps) => {
  const { t } = useTranslation(['datahub', 'core']);
  return (
    <ClientTable<Subject>
      columns={[
        {
          field: (subject) => subject.id.slice(0, 7),
          label: t('index.table.subject')
        },
        {
          field: (subject) => toBasicISOString(new Date(subject.dateOfBirth)),
          label: t('core:identificationData.dateOfBirth.label')
        },
        {
          field: (subject) =>
            subject.sex === 'FEMALE' ? t('core:identificationData.sex.female') : t('core:identificationData.sex.male'),
          label: t('core:identificationData.sex.label')
        }
      ]}
      data={data}
      entriesPerPage={15}
      minRows={15}
      onEntryClick={onSelect}
    />
  );
};
