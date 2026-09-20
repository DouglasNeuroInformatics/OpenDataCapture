import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';

import { EmailTemplateEditor } from '@/components/EmailTemplateEditor';

export type ViewDefaultTemplateDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

/** Read-only view of the message sent when no custom template is active. */
export const ViewDefaultTemplateDialog = ({ onOpenChange, open }: ViewDefaultTemplateDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>
            {t({
              en: 'Built-in default template',
              es: 'Plantilla predeterminada integrada',
              fr: 'Modèle par défaut intégré'
            })}
          </Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'This is the message sent for remote assignments when no custom template is active.',
              es: 'Este es el mensaje que se envía para las tareas remotas cuando no hay ninguna plantilla personalizada activa.',
              fr: "Il s'agit du message envoyé pour les évaluations à distance lorsqu'aucun modèle personnalisé n'est actif."
            })}
          </Dialog.Description>
        </Dialog.Header>
        <EmailTemplateEditor
          readOnly
          idPrefix="template-builtin"
          template={DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE}
          onChange={() => undefined}
        />
        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('core.close')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
