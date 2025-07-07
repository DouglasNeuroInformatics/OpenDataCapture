import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

import { useAppStore } from '@/store';

type MasterDataTableProps = {
  data: Subject[];
  onSelect: (subject: Subject) => void;
};

export const MasterDataTable = ({ data, onSelect }: MasterDataTableProps) => {
  const { t } = useTranslation();
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);
  const speciesVisible = useAppStore((store) => store.currentGroup?.settings.speciesVisible);

  const baseColumns = [
    {
      field: (subject: Subject) => removeSubjectIdScope(subject.id).slice(0, subjectIdDisplaySetting ?? 9),
      label: t('datahub.index.table.subject')
    },
    {
      field: (subject: Subject) => (subject.dateOfBirth ? toBasicISOString(new Date(subject.dateOfBirth)) : 'NULL'),
      label: t('core.identificationData.dateOfBirth.label')
    },
    {
      field: (subject: Subject) => {
        switch (subject.sex) {
          case 'FEMALE':
            return t('core.identificationData.sex.female');
          case 'MALE':
            return t('core.identificationData.sex.male');
          default:
            return 'NULL';
        }
      },
      label: t('core.identificationData.sex.label')
    }
  ];

  const columns = speciesVisible
    ? [
        ...baseColumns,
        {
          field: (subject: Subject) => subject.species ?? 'NULL',
          label: t({
            en: 'Species',
            fr: 'Espece animale'
          })
        }
      ]
    : baseColumns;

  return (
    <ClientTable<Subject>
      columns={columns}
      data={data}
      data-cy="master-data-table"
      entriesPerPage={15}
      minRows={15}
      onEntryClick={onSelect}
    />
  );
};
