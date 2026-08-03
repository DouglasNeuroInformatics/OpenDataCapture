import React from 'react';

import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { DEFAULT_NEW_USER_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { MailTemplate } from '@opendatacapture/schemas/mail';
import { Loader2Icon } from 'lucide-react';

import { EmailTemplateEditor } from '@/components/EmailTemplateEditor';
import { SectionCard } from '@/components/SectionCard';
import { checkTemplateIssue, NEW_USER_TEMPLATE_VARS, REQUIRED_NEW_USER_TEMPLATE_VARS } from '@/utils/email-template';
import { LANGUAGES, omitBlankLanguages } from '@/utils/language';

const defaultTemplate = (): MailTemplate => ({
  body: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.body },
  subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject }
});

export type NewUserTemplateSectionProps = {
  isSaving: boolean;
  onSave: (template: MailTemplate) => void;
  template: MailTemplate;
};

/** Authors the welcome message sent when a user with an email address is created. */
export const NewUserTemplateSection = ({ isSaving, onSave, template: saved }: NewUserTemplateSectionProps) => {
  const { t } = useTranslation();
  const [template, setTemplate] = React.useState<MailTemplate>(() => ({
    body: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.body, ...saved.body },
    subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject, ...saved.subject }
  }));

  // Unlike a group template, this one is sent in whichever language the admin picks at creation
  // time, so every language has to be filled in rather than only the ones started.
  const issue = checkTemplateIssue(template.subject, template.body, REQUIRED_NEW_USER_TEMPLATE_VARS, LANGUAGES);
  const error =
    issue === 'incomplete'
      ? t({
          en: 'Fill in the subject and body for each language.',
          fr: "Remplissez l'objet et le corps pour chaque langue."
        })
      : issue === 'missing-vars'
        ? t({ en: 'The body must include {{username}}.', fr: 'Le corps doit inclure {{username}}.' })
        : undefined;

  return (
    <SectionCard data-testid="mail-template-card">
      <div className="mb-1 flex items-start justify-between gap-4">
        <Heading variant="h4">
          {t({ en: 'New User Email Template', fr: 'Modèle de courriel pour les nouveaux utilisateurs' })}
        </Heading>
        <Button
          className="shrink-0"
          data-testid="mail-template-reset"
          size="sm"
          type="button"
          variant="outline"
          onClick={() => setTemplate(defaultTemplate())}
        >
          {t({ en: 'Reset', fr: 'Réinitialiser' })}
        </Button>
      </div>
      <p className="text-muted-foreground mb-4 text-sm">
        {t({
          en: 'Sent automatically when a new user with an email address is created. The sender chooses the language.',
          fr: "Envoyé automatiquement lors de la création d'un nouvel utilisateur disposant d'une adresse courriel. L'expéditeur choisit la langue."
        })}
      </p>
      <EmailTemplateEditor
        error={error}
        idPrefix="new-user-template"
        template={template}
        variables={NEW_USER_TEMPLATE_VARS}
        onChange={setTemplate}
      />
      <div className="mt-4">
        <Button
          data-testid="mail-template-save"
          disabled={isSaving || Boolean(error)}
          type="button"
          variant="primary"
          onClick={() =>
            onSave({ body: omitBlankLanguages(template.body), subject: omitBlankLanguages(template.subject) })
          }
        >
          {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          {t('core.save')}
        </Button>
      </div>
    </SectionCard>
  );
};
