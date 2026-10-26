import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $CreateGroupData } from '@opendatacapture/schemas/group';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { useCreateGroupMutation } from '@/hooks/useCreateGroupMutation';
import { getApiErrorMessage } from '@/utils/error';

const RouteComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createGroupMutation = useCreateGroupMutation();

  const handleSubmit = async (data: $CreateGroupData) => {
    try {
      await createGroupMutation.mutateAsync({ data });
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        t({
          en: 'Failed to create group',
          es: 'Error al crear el grupo',
          fr: 'Échec de la création du groupe'
        })
      );
      return { errorMessage, success: false } as const;
    }
    void navigate({ to: '..' });
    return undefined;
  };

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Add Group',
            es: 'Agregar grupo',
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

export const Route = createFileRoute('/_app/admin/groups/create')({
  component: RouteComponent
});
