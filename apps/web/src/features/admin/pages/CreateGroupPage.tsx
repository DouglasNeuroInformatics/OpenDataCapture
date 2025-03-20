import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $CreateGroupData } from '@opendatacapture/schemas/group';
import type { CreateGroupData } from '@opendatacapture/schemas/group';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';

import { useCreateGroupMutation } from '../hooks/useCreateGroupMutation';

export const CreateGroupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createGroupMutation = useCreateGroupMutation();

  const handleSubmit = (data: CreateGroupData) => {
    createGroupMutation.mutate({ data });
    navigate('..');
  };

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Add Group',
            fr: 'Ajouter un groupe'
          })}
        </Heading>
      </PageHeader>
      <Form
        className="mx-auto max-w-3xl"
        content={{
          name: {
            kind: 'string',
            label: t('common.groupName'),
            variant: 'input'
          },
          type: {
            kind: 'string',
            label: t('common.groupType'),
            options: {
              CLINICAL: t('common.clinical'),
              RESEARCH: t('common.research')
            },
            variant: 'select'
          }
        }}
        validationSchema={$CreateGroupData.omit({ settings: true })}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
