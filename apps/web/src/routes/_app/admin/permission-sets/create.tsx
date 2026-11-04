import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { PermissionSetForm } from '@/components/PermissionSetForm';
import { useCreatePermissionSetMutation } from '@/hooks/useCreatePermissionSetMutation';
import { getApiErrorMessage } from '@/utils/error';

const RouteComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createPermissionSetMutation = useCreatePermissionSetMutation();

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Add Permission Set',
            es: 'Agregar un conjunto de permisos',
            fr: "Ajouter un ensemble d'autorisations"
          })}
        </Heading>
      </PageHeader>
      <PermissionSetForm
        submitLabel={t({ en: 'Create', es: 'Crear', fr: 'Créer' })}
        onSubmit={async (data) => {
          try {
            await createPermissionSetMutation.mutateAsync({ data });
          } catch (err) {
            const errorMessage = getApiErrorMessage(
              err,
              t({
                en: 'Failed to create permission set',
                es: 'Error al crear el conjunto de permisos',
                fr: "Échec de la création de l'ensemble d'autorisations"
              })
            );
            return { errorMessage, success: false };
          }
          void navigate({ to: '..' });
          return undefined;
        }}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/permission-sets/create')({
  component: RouteComponent
});
