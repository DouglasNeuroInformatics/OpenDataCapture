import React, { useState } from 'react';

import { Button, Input, Label, Select, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import type { Language } from '@opendatacapture/schemas/core';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { CircleHelpIcon } from 'lucide-react';

import { LanguageSelect } from '@/components/LanguageSelect';
import { useGroupQuery } from '@/hooks/useGroupQuery';
import { useMailErrorMessage } from '@/hooks/useMailErrorMessage';
import { useSendAssignmentEmailMutation } from '@/hooks/useSendAssignmentEmailMutation';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { authoredLanguages, LANGUAGES } from '@/utils/language';

const DEFAULT_TEMPLATE_OPTION = '__default__';

export type AssignmentEmailFormProps = {
  assignment: Assignment | null;
  instrumentLanguages?: string[];
};

export const AssignmentEmailForm = ({ assignment, instrumentLanguages }: AssignmentEmailFormProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const sendEmailMutation = useSendAssignmentEmailMutation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const mailErrorMessage = useMailErrorMessage();
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

  const authored = authoredLanguages(selectedBody);
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
            fail(mailErrorMessage(result.error));
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
                {/* Only the email is localized: the gateway does not read the link's `lang` param. */}
                {t({
                  en: 'The email is sent in the selected language when the template has been written in it. Participants choose their own language when they open the assignment.',
                  fr: "Le courriel est envoyé dans la langue sélectionnée lorsque le modèle a été rédigé dans celle-ci. Les participants choisissent leur propre langue à l'ouverture de l'évaluation."
                })}
              </p>
            </Tooltip.Content>
          </Tooltip>
        </div>
        <LanguageSelect
          data-testid="assignment-language"
          id="assignment-language"
          options={languageOptions}
          value={language}
          onChange={setLanguageChoice}
        />
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
          // While the group query is in flight `selectedTemplate` reads as the built-in default,
          // and posting that is indistinguishable from deliberately choosing it. `isLoading`
          // rather than `isPending`: a disabled query (an assignment with no group) stays pending
          // forever and would leave the button permanently dead.
          disabled={!recipient || sendEmailMutation.isPending || groupQuery.isLoading}
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
