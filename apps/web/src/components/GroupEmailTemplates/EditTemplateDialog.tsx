import React from 'react';

import { Button, Dialog, Input, Label } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';
import type { MailTemplate } from '@opendatacapture/schemas/mail';

import { EmailTemplateEditor } from '@/components/EmailTemplateEditor';
import { ASSIGNMENT_TEMPLATE_VARS } from '@/utils/email-template';

type EditTemplateFormProps = {
  isPending: boolean;
  onCancel: () => void;
  onSave: (template: GroupEmailTemplate) => void;
  template: GroupEmailTemplate;
  validateContent: (template: MailTemplate) => string | undefined;
  validateName: (name: string) => string | undefined;
};

const EditTemplateForm = ({
  isPending,
  onCancel,
  onSave,
  template,
  validateContent,
  validateName
}: EditTemplateFormProps) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [name, setName] = React.useState(template.name);
  const [draft, setDraft] = React.useState<MailTemplate>({
    body: template.body ?? {},
    subject: template.subject ?? {}
  });

  const contentError = validateContent(draft);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nameError = validateName(name);
    if (nameError) {
      addNotification({ message: nameError, type: 'error' });
      return;
    }
    if (contentError) {
      return;
    }
    onSave({ ...template, ...draft, name: name.trim() });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="template-edit-name">{t({ en: 'Name', es: 'Nombre', fr: 'Nom' })}</Label>
        <Input
          data-testid="template-edit-name"
          id="template-edit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <EmailTemplateEditor
        error={contentError}
        idPrefix="template-edit"
        template={draft}
        variables={ASSIGNMENT_TEMPLATE_VARS}
        onChange={setDraft}
      />
      <Dialog.Footer>
        <Button className="flex-1" type="button" variant="outline" onClick={onCancel}>
          {t('core.cancel')}
        </Button>
        <Button
          className="flex-1"
          data-testid="template-edit-save"
          disabled={isPending || Boolean(contentError)}
          type="submit"
        >
          {t('core.save')}
        </Button>
      </Dialog.Footer>
    </form>
  );
};

export type EditTemplateDialogProps = {
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: GroupEmailTemplate) => void;
  /** The template being edited, or null when the dialog is closed. */
  template: GroupEmailTemplate | null;
  validateContent: (template: MailTemplate) => string | undefined;
  validateName: (name: string) => string | undefined;
};

export const EditTemplateDialog = ({ template, ...props }: EditTemplateDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={template !== null} onOpenChange={props.onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Edit template', es: 'Editar plantilla', fr: 'Modifier le modèle' })}</Dialog.Title>
        </Dialog.Header>
        {/* Mounted only while open, so the draft resets between templates. */}
        {template && (
          <EditTemplateForm
            isPending={props.isPending}
            template={template}
            validateContent={props.validateContent}
            validateName={props.validateName}
            onCancel={() => props.onOpenChange(false)}
            onSave={props.onSave}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
