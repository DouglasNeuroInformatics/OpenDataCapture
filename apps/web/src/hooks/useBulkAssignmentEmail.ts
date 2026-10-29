import { useState } from 'react';

import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { $SendBulkAssignmentEmailData } from '@opendatacapture/schemas/mail';
import { isAxiosError } from 'axios';

import { useGroupQuery } from '@/hooks/useGroupQuery';
import { useSendBulkAssignmentEmailMutation } from '@/hooks/useSendBulkAssignmentEmailMutation';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import type { SubjectEmails } from '@/utils/bulk-assignments';
import { sendableLanguages } from '@/utils/language';

type BulkEmailStatus = 'error' | 'pending' | 'sent';

/** How many times one recipient's message waits out a rate limit before it is called a failure. */
const RATE_LIMIT_RETRIES = 3;

/** The default wait when the server throttles without saying for how long, in milliseconds. */
const DEFAULT_RETRY_AFTER_MS = 5_000;

/**
 * How long to wait before retrying a throttled request, or `null` when the failure is not a rate
 * limit and retrying it would be guessing.
 */
function rateLimitDelay(err: unknown): null | number {
  if (!isAxiosError(err) || err.response?.status !== 429) {
    return null;
  }
  // `Retry-After` is in seconds when it is present at all; anything unparseable falls back rather
  // than retrying immediately, which would only be throttled again.
  const seconds = Number(err.response.headers['retry-after']);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : DEFAULT_RETRY_AFTER_MS;
}

/** The value standing in for "no custom template", which the API expects as a null template id. */
const DEFAULT_TEMPLATE_OPTION = '__default__';

type UseBulkAssignmentEmailOptions = {
  assignments: { id: string; subjectId: string }[];
  emails: SubjectEmails;
  groupId: string;
};

/**
 * The template choice, language choice and send state behind the results step's bulk email. It lives
 * here rather than in a component because the per-row status icons and the send button that produces
 * them are rendered in different parts of the step: the table body and the card footer.
 */
const useBulkAssignmentEmail = ({ assignments, emails, groupId }: UseBulkAssignmentEmailOptions) => {
  const { resolvedLanguage, t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const groupQuery = useGroupQuery(groupId);
  const setupStateQuery = useSetupStateQuery();
  const sendEmailMutation = useSendBulkAssignmentEmailMutation();

  const [templateChoice, setTemplateChoice] = useState<null | string>(null);
  const [languageChoice, setLanguageChoice] = useState<Language>(resolvedLanguage);
  const [statuses, setStatuses] = useState<{ [key: string]: BulkEmailStatus }>({});
  const [isSending, setIsSending] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const templates = groupQuery.data?.emailTemplates ?? [];
  const activeValue = groupQuery.data?.activeAssignmentEmailTemplateId ?? DEFAULT_TEMPLATE_OPTION;
  const selectedTemplate = templateChoice ?? activeValue;

  const templateOptions = [
    {
      label: t({ en: 'Built-in default', es: 'Predeterminada integrada', fr: 'Modèle par défaut' }),
      value: DEFAULT_TEMPLATE_OPTION
    },
    ...templates.map((template) => ({ label: template.name, value: template.id }))
  ].sort((a, b) => Number(b.value === activeValue) - Number(a.value === activeValue));

  const selectedBody =
    selectedTemplate === DEFAULT_TEMPLATE_OPTION
      ? DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body
      : templates.find((template) => template.id === selectedTemplate)?.body;

  const templateLanguages = sendableLanguages(selectedBody, setupStateQuery.data.activeLanguages);
  // Clamp to what is offered: switching to a template authored in another language must not leave
  // the trigger showing a value with no matching item while a different one is posted.
  const language = templateLanguages.includes(languageChoice) ? languageChoice : templateLanguages[0]!;

  const emailable = assignments.filter((assignment) => emails[assignment.subjectId]?.trim());
  /**
   * One message per subject rather than per assignment: a subject assigned three instruments is
   * asked once, in an email listing all three links. Grouping is by subject and not by address, so
   * two subjects sharing an address still get their own message and no email ever carries links
   * belonging to someone else.
   */
  const recipients = [...new Set(emailable.map((assignment) => assignment.subjectId))].map((subjectId) => ({
    assignmentIds: emailable.filter((assignment) => assignment.subjectId === subjectId).map(({ id }) => id),
    recipient: emails[subjectId]!
  }));
  /**
   * Who a send would actually write to: everyone whose message has not gone out yet. A recipient
   * already marked sent is left out, so pressing the button again retries the failures instead of
   * mailing a second copy of every link that arrived - and a batch where nothing failed has nobody
   * left to write to, which is what retires the button.
   */
  const pending = recipients.filter(({ assignmentIds }) => {
    return assignmentIds.some((assignmentId) => statuses[assignmentId] !== 'sent');
  });
  // Read off the batch on screen rather than off any send that ever happened, so the next batch -
  // whose assignments are new rows with new ids - starts sendable again.
  const hasSent = recipients.length > 0 && pending.length === 0;
  /**
   * Whether this batch has been sent at all, which is what makes what is left a retry rather than a
   * first attempt - true even when every message failed, and false for a batch created after one
   * was already emailed, since those are new assignments with ids no status mentions.
   */
  const hasAttempted = recipients.some(({ assignmentIds }) => {
    return assignmentIds.some((assignmentId) => statuses[assignmentId]);
  });

  /**
   * Send one recipient's message, waiting out a rate limit rather than reporting it as a failure.
   *
   * The API throttles assignment email per client, and a batch is far larger than that window
   * allows, so a 429 is an instruction to slow down and not a refusal: the server has not sent
   * anything, which is what makes retrying the same request safe. Any other failure is reported as
   * one and left for the operator to retry, since this cannot know whether the mail went out.
   */
  const sendOne = async (data: $SendBulkAssignmentEmailData): Promise<BulkEmailStatus> => {
    for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt++) {
      try {
        const result = await sendEmailMutation.mutateAsync(data);
        return result.status === 'SENT' ? 'sent' : 'error';
      } catch (err) {
        const retryAfter = rateLimitDelay(err);
        if (retryAfter === null || attempt === RATE_LIMIT_RETRIES) {
          return 'error';
        }
        await new Promise((resolve) => {
          setTimeout(resolve, retryAfter);
        });
      }
    }
    return 'error';
  };

  const sendAll = async () => {
    setIsSending(true);
    setCompletedCount(0);
    const next = { ...statuses };
    for (const { assignmentIds } of pending) {
      for (const assignmentId of assignmentIds) {
        next[assignmentId] = 'pending';
      }
    }
    setStatuses({ ...next });

    let sentCount = 0;
    let failCount = 0;

    // Counted in emails rather than links, since that is what the recipient receives and what the
    // operator is being told about.
    for (const { assignmentIds, recipient } of pending) {
      const status = await sendOne({
        assignmentIds,
        language,
        recipient,
        templateId: selectedTemplate === DEFAULT_TEMPLATE_OPTION ? null : selectedTemplate
      });
      if (status === 'sent') {
        sentCount++;
      } else {
        failCount++;
      }
      // Every link in the message shares its outcome, so each of the subject's rows reports it.
      for (const assignmentId of assignmentIds) {
        next[assignmentId] = status;
      }
      setStatuses({ ...next });
      setCompletedCount(sentCount + failCount);
    }

    setIsSending(false);
    addNotification({
      message:
        failCount === 0
          ? t(
              {
                en: '{} sent, 0 failed',
                es: '{} enviados, 0 fallidos',
                fr: '{} envoyés, 0 échoués'
              },
              { args: [String(sentCount)] }
            )
          : t(
              {
                en: '{} sent, {} failed',
                es: '{} enviados, {} fallidos',
                fr: '{} envoyés, {} échoués'
              },
              { args: [String(sentCount), String(failCount)] }
            ),
      type: failCount === 0 ? 'success' : 'error'
    });
  };

  return {
    completedCount,
    hasAttempted,
    hasSent,
    isLoading: groupQuery.isLoading,
    isSending,
    language,
    pending,
    recipients,
    selectedTemplate,
    sendAll,
    setLanguageChoice,
    setTemplateChoice,
    statuses,
    templateLanguages,
    templateOptions,
    templates
  };
};

type BulkAssignmentEmail = ReturnType<typeof useBulkAssignmentEmail>;

export { useBulkAssignmentEmail };
export type { BulkAssignmentEmail, BulkEmailStatus };
