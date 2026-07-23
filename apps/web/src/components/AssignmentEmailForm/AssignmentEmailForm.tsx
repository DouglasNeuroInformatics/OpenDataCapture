import React, { useState } from 'react';

import { Button, Input, Label, Select, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Group } from '@opendatacapture/schemas/group';
import type { LocalizedString, MailLanguage } from '@opendatacapture/schemas/mail';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleHelpIcon } from 'lucide-react';

import { useSendAssignmentEmailMutation } from '@/hooks/useSendAssignmentEmailMutation';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';
import { ALL_LANGUAGES } from '@/utils/languages';

const DEFAULT_TEMPLATE_OPTION = '__default__';

function getBodyLanguages(body: LocalizedString | null | undefined): string[] {
  if (!body) {
    return [];
  }
  return (Object.keys(body) as (keyof LocalizedString)[]).filter((k) => body[k]);
}

export const AssignmentEmailForm: React.FC<{
  assignmentId: string | undefined;
  instrumentLanguages?: string[];
}> = ({ assignmentId, instrumentLanguages }) => {
  const { resolvedLanguage, t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const sendEmailMutation = useSendAssignmentEmailMutation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const activeLanguages = setupStateQuery.data.activeLanguages ?? ['en', 'fr'];
  const [recipient, setRecipient] = useState('');
  const [language, setLanguage] = useState<string>(
    activeLanguages.includes(resolvedLanguage) ? resolvedLanguage : (activeLanguages[0] ?? 'en')
  );
  const [templateChoice, setTemplateChoice] = useState<null | string>(null);
  const [feedback, setFeedback] = useState<null | { message: string; tone: 'error' | 'success' }>(null);

  const groupId = currentGroup?.id;
  const groupQuery = useQuery({
    enabled: Boolean(groupId && setupStateQuery.data.isMailEnabled),
    queryFn: async () => $Group.parseAsync((await axios.get(`/v1/groups/${groupId}`)).data),
    queryKey: ['group', groupId]
  });
  const remoteTemplates = (groupQuery.data?.emailTemplates ?? []).filter((tpl) => tpl.category === 'REMOTE_ASSIGNMENT');
  const activeValue = groupQuery.data?.activeAssignmentEmailTemplateId ?? DEFAULT_TEMPLATE_OPTION;
  const selectedTemplate = templateChoice ?? activeValue;
  const templateOptions = [
    {
      label: t({ en: 'Built-in default', fr: 'Modèle par défaut' }),
      value: DEFAULT_TEMPLATE_OPTION
    },
    ...remoteTemplates.map((tpl) => ({ label: tpl.name, value: tpl.id }))
  ].sort((a, b) => (a.value === activeValue ? -1 : b.value === activeValue ? 1 : 0));

  const selectedTemplateBody =
    selectedTemplate === DEFAULT_TEMPLATE_OPTION
      ? DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body
      : remoteTemplates.find((tpl) => tpl.id === selectedTemplate)?.body;

  const availableLanguages = getBodyLanguages(selectedTemplateBody).filter((l) => activeLanguages.includes(l));

  const sendEmail = () => {
    if (!assignmentId || !recipient) {
      return;
    }
    setFeedback(null);
    sendEmailMutation.mutate(
      {
        assignmentId,
        language: language as MailLanguage,
        recipient,
        templateId: selectedTemplate === DEFAULT_TEMPLATE_OPTION ? null : selectedTemplate
      },
      {
        onError: () => {
          const message = t({
            en: 'The email could not be sent',
            fr: "Le courriel n'a pas pu être envoyé"
          });
          setFeedback({ message, tone: 'error' });
          addNotification({
            message,
            title: t({ en: 'Email failed', fr: 'Échec du courriel' }),
            type: 'error'
          });
        },
        onSuccess: (result) => {
          if (result.status === 'SENT') {
            const message = t({
              en: `Assignment link sent to ${recipient}`,
              fr: `Lien d'évaluation envoyé à ${recipient}`
            });
            setFeedback({ message, tone: 'success' });
            addNotification({
              message,
              title: t({ en: 'Email sent', fr: 'Courriel envoyé' }),
              type: 'success'
            });
            setRecipient('');
          } else {
            const message =
              result.error ??
              t({
                en: 'The email could not be sent',
                fr: "Le courriel n'a pas pu être envoyé"
              });
            setFeedback({ message, tone: 'error' });
            addNotification({
              message,
              title: t({ en: 'Email failed', fr: 'Échec du courriel' }),
              type: 'error'
            });
          }
        }
      }
    );
  };

  if (!setupStateQuery.data.isMailEnabled) {
    return null;
  }

  const templateLanguages = availableLanguages.length > 0 ? availableLanguages : activeLanguages;
  const languageDropdownOptions = instrumentLanguages
    ? templateLanguages.filter((l) => instrumentLanguages.includes(l))
    : templateLanguages;

  return (
    <div className="flex flex-col gap-2">
      {remoteTemplates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assignment-template">{t({ en: 'Email template', fr: 'Modèle de courriel' })}</Label>
          <Select value={selectedTemplate} onValueChange={setTemplateChoice}>
            <Select.Trigger className="w-full" id="assignment-template">
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
          <Label>{t({ en: 'Email language', fr: 'Langue du courriel' })}</Label>
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
        <Select value={language} onValueChange={setLanguage}>
          <Select.Trigger className="w-[180px]">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {languageDropdownOptions.map((code) => (
                <Select.Item key={code} value={code}>
                  {ALL_LANGUAGES[code] ?? code}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select>
      </div>
      <Label htmlFor="assignment-email">
        {t({
          en: 'Email link to participant',
          fr: 'Envoyer le lien au participant par courriel'
        })}
      </Label>
      <div className="flex gap-2">
        <Input
          className="h-9"
          id="assignment-email"
          placeholder={t({
            en: 'recipient@example.org',
            fr: 'destinataire@exemple.org'
          })}
          type="email"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
        />
        <Button
          className="whitespace-nowrap"
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
          className={
            feedback.tone === 'success'
              ? 'text-xs font-medium text-green-700 dark:text-green-500'
              : 'text-destructive text-xs font-medium'
          }
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
};
