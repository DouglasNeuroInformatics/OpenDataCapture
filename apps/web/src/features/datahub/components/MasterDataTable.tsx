import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

import { useAppStore } from '@/store';

export type MasterDataTableProps = {
  data: Subject[];
  onSelect: (subject: Subject) => void;
};

export const MasterDataTable = ({ data, onSelect }: MasterDataTableProps) => {
  const { t } = useTranslation();
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);
  return (
    <ClientTable<Subject>
      columns={[
        {
          field: (subject) =>
            subjectIdDisplaySetting
              ? removeSubjectIdScope(subject.id).slice(0, subjectIdDisplaySetting)
              : removeSubjectIdScope(subject.id).slice(0, 9),
          label: t('datahub.index.table.subject')
        },
        {
          field: (subject) => (subject.dateOfBirth ? toBasicISOString(new Date(subject.dateOfBirth)) : 'NULL'),
          label: t('core.identificationData.dateOfBirth.label')
        },
        {
          field: (subject) => {
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
      ]}
      data={data}
      data-cy="master-data-table"
      entriesPerPage={15}
      minRows={15}
      onEntryClick={onSelect}
    />
  );
};
