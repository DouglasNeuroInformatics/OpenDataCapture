import React from 'react';

import { Button, Dialog, Heading, Input, Label } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { MailTemplate } from '@opendatacapture/schemas/mail';

import { EmailTemplateEditor } from '@/components/EmailTemplateEditor';
import { ASSIGNMENT_TEMPLATE_VARS } from '@/utils/email-template';
import { LANGUAGE_LABELS, LANGUAGES } from '@/utils/language';

const emptyTemplate = (): MailTemplate => ({ body: {}, subject: {} });

export type CreateTemplateFormProps = {
  isPending: boolean;
  /** Resolves true once the template is saved; the form clears only then. */
  onCreate: (name: string, template: MailTemplate) => Promise<boolean>;
  validateContent: (template: MailTemplate) => string | undefined;
  validateName: (name: string) => string | undefined;
};

export const CreateTemplateForm = ({ isPending, onCreate, validateContent, validateName }: CreateTemplateFormProps) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [name, setName] = React.useState('');
  const [draft, setDraft] = React.useState<MailTemplate>(emptyTemplate);
  const [isConfirmingMissingTranslations, setIsConfirmingMissingTranslations] = React.useState(false);

  const contentError = validateContent(draft);
  const missingLanguages = LANGUAGES.filter((code) => !draft.body[code]?.trim());

  const create = async () => {
    if (!(await onCreate(name.trim(), draft))) {
      return;
    }
    setName('');
    setDraft(emptyTemplate());
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    if (missingLanguages.length > 0) {
      setIsConfirmingMissingTranslations(true);
      return;
    }
    void create();
  };

  return (
    <React.Fragment>
      <form
        className="border-border flex flex-col gap-3 rounded-2xl border p-5"
        data-testid="template-create-form"
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <Heading variant="h5">{t({ en: 'New template', fr: 'Nouveau modèle' })}</Heading>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template-name">{t({ en: 'Name', fr: 'Nom' })}</Label>
          <Input
            data-testid="template-name"
            id="template-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <EmailTemplateEditor
          error={contentError}
          idPrefix="template-create"
          template={draft}
          variables={ASSIGNMENT_TEMPLATE_VARS}
          onChange={setDraft}
        />
        <div>
          <Button data-testid="template-create-submit" disabled={isPending || Boolean(contentError)} type="submit">
            {t({ en: 'Add template', fr: 'Ajouter le modèle' })}
          </Button>
        </div>
      </form>

      <Dialog open={isConfirmingMissingTranslations} onOpenChange={setIsConfirmingMissingTranslations}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Missing translations', fr: 'Traductions manquantes' })}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Description>
            {t(
              {
                en: 'Warning: This template is missing translations for: {}.',
                fr: 'Attention : Ce modèle est sans traduction pour : {}.'
              },
              { args: [missingLanguages.map((code) => t(LANGUAGE_LABELS[code])).join(', ')] }
            )}
          </Dialog.Description>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={() => setIsConfirmingMissingTranslations(false)}>
              {t('core.cancel')}
            </Button>
            <Button
              data-testid="template-create-anyway"
              type="button"
              variant="primary"
              onClick={() => {
                setIsConfirmingMissingTranslations(false);
                void create();
              }}
            >
              {t({ en: 'Add anyway', fr: 'Ajouter quand même' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </React.Fragment>
  );
};
