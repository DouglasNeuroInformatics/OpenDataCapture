import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { PermissionSetForm } from '@/components/PermissionSetForm';
import { useConfirmPermissionSetDeletion } from '@/hooks/useConfirmPermissionSetDeletion';
import { permissionSetQueryOptions, usePermissionSetQuery } from '@/hooks/usePermissionSetQuery';
import { useUpdatePermissionSetMutation } from '@/hooks/useUpdatePermissionSetMutation';
import { getApiErrorMessage } from '@/utils/error';

const PermissionSetEditor = ({ permissionSetId }: { permissionSetId: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissionSetQuery = usePermissionSetQuery(permissionSetId);
  const updatePermissionSetMutation = useUpdatePermissionSetMutation();
  const confirmDeletion = useConfirmPermissionSetDeletion();
  const permissionSet = permissionSetQuery.data;

  return (
    <div data-testid="admin-permission-set-page">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Manage Permission Set',
            es: 'Gestionar el conjunto de permisos',
            fr: "Gérer l'ensemble d'autorisations"
          })}
        </Heading>
      </PageHeader>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-6">
        <Link
          className="text-muted-foreground focus-visible:ring-ring flex items-center gap-0.5 self-start rounded-sm text-[11px] font-semibold tracking-widest uppercase transition-colors hover:text-blue-600 focus-visible:ring-1 focus-visible:outline-hidden dark:hover:text-blue-400"
          data-testid="admin-permission-set-back"
          to="/admin/permission-sets"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          {t({ en: 'Return', es: 'Volver', fr: 'Retour' })}
        </Link>
        <PermissionSetForm
          initialValues={permissionSet}
          secondaryAction={
            <Button
              className="w-full"
              data-testid="delete-permission-set"
              type="button"
              variant="danger"
              onClick={() => confirmDeletion(permissionSet, { onDeleted: () => void navigate({ to: '..' }) })}
            >
              {t('core.delete')}
            </Button>
          }
          submitLabel={t({ en: 'Save Changes', es: 'Guardar los cambios', fr: 'Enregistrer les modifications' })}
          onSubmit={async (data) => {
            try {
              await updatePermissionSetMutation.mutateAsync({ data, id: permissionSet.id });
            } catch (err) {
              const errorMessage = getApiErrorMessage(
                err,
                t({
                  en: 'Failed to save permission set',
                  es: 'Error al guardar el conjunto de permisos',
                  fr: "Échec de l'enregistrement de l'ensemble d'autorisations"
                })
              );
              return { errorMessage, success: false };
            }
            return undefined;
          }}
        />
      </div>
    </div>
  );
};

const RouteComponent = () => {
  const { permissionSetId } = Route.useParams();
  return <PermissionSetEditor key={permissionSetId} permissionSetId={permissionSetId} />;
};

export const Route = createFileRoute('/_app/admin/permission-sets/$permissionSetId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(permissionSetQueryOptions(params.permissionSetId));
  }
});
