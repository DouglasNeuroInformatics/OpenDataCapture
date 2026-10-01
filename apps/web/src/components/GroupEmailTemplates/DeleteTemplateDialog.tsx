import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';

export type DeleteTemplateDialogProps = {
  isPending: boolean;
  onConfirm: (template: GroupEmailTemplate) => void;
  onOpenChange: (open: boolean) => void;
  /** The template awaiting confirmation, or null when the dialog is closed. */
  template: GroupEmailTemplate | null;
};

export const DeleteTemplateDialog = ({ isPending, onConfirm, onOpenChange, template }: DeleteTemplateDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={template !== null} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {t({ en: 'Delete template', es: 'Eliminar plantilla', fr: 'Supprimer le modèle' })}
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
          {t(
            {
              en: 'Permanently delete "{}"? This cannot be undone.',
              es: '¿Eliminar "{}" de forma permanente? Esta acción no se puede deshacer.',
              fr: 'Supprimer définitivement « {} » ? Cette action est irréversible.'
            },
            { args: [template?.name ?? ''] }
          )}
        </Dialog.Description>
        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('core.cancel')}
          </Button>
          <Button
            data-testid="template-delete-confirm"
            disabled={isPending}
            type="button"
            variant="danger"
            onClick={() => template && onConfirm(template)}
          >
            {t('core.delete')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
