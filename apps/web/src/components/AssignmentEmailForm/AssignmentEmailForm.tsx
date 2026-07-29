import React, { useState } from 'react';

import { Button, Input, Label, Select, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import type { Language, LocalizedString } from '@opendatacapture/schemas/core';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { CircleHelpIcon } from 'lucide-react';

import { LANGUAGE_LABELS, LANGUAGES } from '@/components/EmailTemplateEditor';
import { useGroupQuery } from '@/hooks/useGroupQuery';
import { useSendAssignmentEmailMutation } from '@/hooks/useSendAssignmentEmailMutation';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';

const DEFAULT_TEMPLATE_OPTION = '__default__';

const bodyLanguages = (body: LocalizedString | null | undefined): Language[] =>
  body ? LANGUAGES.filter((code) => body[code]) : [];

export const AssignmentEmailForm: React.FC<{
  assignment: Assignment | null;
  instrumentLanguages?: string[];
}> = ({ assignment, instrumentLanguages }) => {
  const { resolvedLanguage, t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const sendEmailMutation = useSendAssignmentEmailMutation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [recipient, setRecipient] = useState('');
  const [languageChoice, setLanguageChoice] = useState<Language>(resolvedLanguage);
  const [templateChoice, setTemplateChoice] = useState<null | string>(null);
  const [feedback, setFeedback] = useState<null | { message: string; tone: 'error' | 'success' }>(null);

  // The server resolves the template from the assignment's own group, so this must query that
  // group rather than whichever one is currently selected in the app store — on the datahub they
  // can differ, and the two would then disagree about which templates exist.
  const groupQuery = useGroupQuery(setupStateQuery.data.isMailEnabled ? assignment?.groupId : null);

  const templates = groupQuery.data?.emailTemplates ?? [];
  const activeValue = groupQuery.data?.activeAssignmentEmailTemplateId ?? DEFAULT_TEMPLATE_OPTION;
  const selectedTemplate = templateChoice ?? activeValue;
  const templateOptions = [
    { label: t({ en: 'Built-in default', fr: 'Modèle par défaut' }), value: DEFAULT_TEMPLATE_OPTION },
    ...templates.map((template) => ({ label: template.name, value: template.id }))
  ].sort((a, b) => (a.value === activeValue ? -1 : b.value === activeValue ? 1 : 0));

  const selectedBody =
    selectedTemplate === DEFAULT_TEMPLATE_OPTION
      ? DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body
      : templates.find((template) => template.id === selectedTemplate)?.body;

  const authored = bodyLanguages(selectedBody);
  const templateLanguages = authored.length > 0 ? authored : LANGUAGES;
  const languageOptions = instrumentLanguages
    ? templateLanguages.filter((code) => instrumentLanguages.includes(code))
    : templateLanguages;
  // Clamp to what is actually offered: switching to a template authored in one language must not
  // leave the trigger showing a value with no matching item while a different one is posted.
  const language = languageOptions.includes(languageChoice) ? languageChoice : (languageOptions[0] ?? 'en');

  const sendEmail = () => {
    if (!assignment || !recipient) {
      return;
    }
    setFeedback(null);
    const fail = (message: string) => {
      setFeedback({ message, tone: 'error' });
      addNotification({ message, title: t({ en: 'Email failed', fr: 'Échec du courriel' }), type: 'error' });
    };
    sendEmailMutation.mutate(
      {
        assignmentId: assignment.id,
        language,
        recipient,
        templateId: selectedTemplate === DEFAULT_TEMPLATE_OPTION ? null : selectedTemplate
      },
      {
        onError: () => fail(t({ en: 'The email could not be sent', fr: "Le courriel n'a pas pu être envoyé" })),
        onSuccess: (result) => {
          if (result.status !== 'SENT') {
            fail(result.error ?? t({ en: 'The email could not be sent', fr: "Le courriel n'a pas pu être envoyé" }));
            return;
          }
          const message = t(
            { en: 'Assignment link sent to {}', fr: "Lien d'évaluation envoyé à {}" },
            { args: [recipient] }
          );
          setFeedback({ message, tone: 'success' });
          addNotification({ message, title: t({ en: 'Email sent', fr: 'Courriel envoyé' }), type: 'success' });
          setRecipient('');
        }
      }
    );
  };

  if (!setupStateQuery.data.isMailEnabled) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2" data-testid="assignment-email-form">
      {templates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assignment-template">{t({ en: 'Email template', fr: 'Modèle de courriel' })}</Label>
          <Select value={selectedTemplate} onValueChange={setTemplateChoice}>
            <Select.Trigger className="w-full" data-testid="assignment-template" id="assignment-template">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {templateOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="assignment-language">{t({ en: 'Email language', fr: 'Langue du courriel' })}</Label>
          <Tooltip>
            <Tooltip.Trigger className="p-0 hover:bg-transparent" size="icon" variant="ghost">
              <CircleHelpIcon className="text-muted-foreground h-4 w-4" />
            </Tooltip.Trigger>
            <Tooltip.Content className="max-w-xs">
              <p>
                {t({
                  en: 'Emails and assignments are sent in the selected language when available. However, subjects may still choose a different preferred language on the gateway.',
                  fr: "Les courriels et les évaluations sont envoyés dans la langue sélectionnée lorsqu'elle est disponible. Cependant, les sujets peuvent toujours choisir une langue préférée différente sur le portail."
                })}
              </p>
            </Tooltip.Content>
          </Tooltip>
        </div>
        <Select value={language} onValueChange={(value) => setLanguageChoice(value as Language)}>
          <Select.Trigger className="w-[180px]" data-testid="assignment-language" id="assignment-language">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {languageOptions.map((code) => (
                <Select.Item key={code} value={code}>
                  {t(LANGUAGE_LABELS[code])}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select>
      </div>
      <Label htmlFor="assignment-email">
        {t({ en: 'Email link to participant', fr: 'Envoyer le lien au participant par courriel' })}
      </Label>
      <div className="flex gap-2">
        <Input
          className="h-9"
          data-testid="assignment-email"
          id="assignment-email"
          placeholder={t({ en: 'recipient@example.org', fr: 'destinataire@exemple.org' })}
          type="email"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
        />
        <Button
          className="whitespace-nowrap"
          data-testid="assignment-email-submit"
          disabled={!recipient || sendEmailMutation.isPending}
          type="button"
          variant="primary"
          onClick={sendEmail}
        >
          {sendEmailMutation.isPending
            ? t({ en: 'Sending…', fr: 'Envoi en cours…' })
            : t({ en: 'Email assignment', fr: 'Envoyer par courriel' })}
        </Button>
      </div>
      {feedback && (
        <p
          className={feedback.tone === 'error' ? 'text-destructive text-xs font-medium' : 'text-xs font-medium'}
          data-testid="assignment-email-feedback"
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
};
