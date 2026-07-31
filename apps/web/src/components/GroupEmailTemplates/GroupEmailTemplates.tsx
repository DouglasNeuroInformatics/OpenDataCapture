import React from 'react';

import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';
import type { MailTemplate } from '@opendatacapture/schemas/mail';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { groupQueryOptions, useGroupQuery } from '@/hooks/useGroupQuery';
import { useUpdateGroupMutation } from '@/hooks/useUpdateGroupMutation';
import { useAppStore } from '@/store';
import { ASSIGNMENT_TEMPLATE_VARS, checkTemplateIssue } from '@/utils/email-template';
import { authoredLanguages, omitBlankLanguages } from '@/utils/language';

import { CreateTemplateForm } from './CreateTemplateForm';
import { DeleteTemplateDialog } from './DeleteTemplateDialog';
import { EditTemplateDialog } from './EditTemplateDialog';
import { TemplateRow } from './TemplateRow';
import { ViewDefaultTemplateDialog } from './ViewDefaultTemplateDialog';

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="text-muted-foreground border-border rounded-md border border-dashed p-3 text-sm">{children}</div>
);

export const GroupEmailTemplates = () => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const groupId = currentGroup?.id;
  const queryClient = useQueryClient();
  // A conflict has to be recoverable in place, so it must not reach the router error boundary.
  const updateGroupMutation = useUpdateGroupMutation({ successNotification: false, throwOnError: false });
  const groupQuery = useGroupQuery(groupId);

  const group = groupQuery.data;
  const templates = group?.emailTemplates ?? [];
  const activeId = group?.activeAssignmentEmailTemplateId ?? null;

  const [editing, setEditing] = React.useState<GroupEmailTemplate | null>(null);
  const [deleting, setDeleting] = React.useState<GroupEmailTemplate | null>(null);
  const [isViewingDefault, setIsViewingDefault] = React.useState(false);

  const validateContent = (template: MailTemplate): string | undefined => {
    // Scope validation to the languages actually started, so a pristine form is not an error.
    const issue = checkTemplateIssue(
      template.subject,
      template.body,
      ASSIGNMENT_TEMPLATE_VARS,
      authoredLanguages(template.body)
    );
    if (issue === 'incomplete') {
      return t({
        en: 'Fill in the subject and body in each language you have started.',
        fr: "Remplissez l'objet et le corps dans chaque langue commencée."
      });
    }
    if (issue === 'missing-vars') {
      return t({
        en: 'The body must include {{url}} and {{expiresAt}}.',
        fr: 'Le corps doit inclure {{url}} et {{expiresAt}}.'
      });
    }
    return undefined;
  };

  const validateName = (candidate: string, exceptId?: string): string | undefined => {
    const trimmed = candidate.trim();
    if (!trimmed) {
      return t({ en: 'A name is required', fr: 'Un nom est requis' });
    }
    const isDuplicate = templates.some(
      (template) => template.id !== exceptId && template.name.toLowerCase() === trimmed.toLowerCase()
    );
    return isDuplicate
      ? t({ en: 'A template with this name already exists', fr: 'Un modèle avec ce nom existe déjà' })
      : undefined;
  };

  /**
   * Replace the group's whole template list. `expectedUpdatedAt` pins the revision this edit was
   * composed against, so a concurrent edit by another manager is rejected rather than overwritten.
   */
  const persist = async (next: GroupEmailTemplate[], nextActiveId: null | string): Promise<boolean> => {
    if (!group) {
      return false;
    }
    try {
      const updated = await updateGroupMutation.mutateAsync({
        activeAssignmentEmailTemplateId: nextActiveId,
        emailTemplates: next.map((template) => ({
          ...template,
          body: omitBlankLanguages(template.body),
          subject: omitBlankLanguages(template.subject)
        })),
        expectedUpdatedAt: group.updatedAt
      });
      // Seed the cache from the response rather than invalidating. Every write moves `updatedAt`,
      // so waiting on a refetch would leave the next edit composed against the previous revision —
      // which the server then rejects as a conflict with this client's own change.
      queryClient.setQueryData(groupQueryOptions(groupId).queryKey, updated);
      addNotification({ type: 'success' });
      return true;
    } catch (err) {
      const isConflict = isAxiosError(err) && err.response?.status === 409;
      addNotification({
        message: isConflict
          ? t({
              en: 'Someone else changed these templates while you were editing. Your changes were not saved — reload the page and try again.',
              fr: "Quelqu'un d'autre a modifié ces modèles pendant votre édition. Vos modifications n'ont pas été enregistrées — rechargez la page et réessayez."
            })
          : t({
              en: 'Your changes were not saved. Check your connection and try again.',
              fr: "Vos modifications n'ont pas été enregistrées. Vérifiez votre connexion et réessayez."
            }),
        title: t({ en: 'Save failed', fr: "Échec de l'enregistrement" }),
        type: 'error'
      });
      if (isConflict) {
        await queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
      }
      return false;
    }
  };

  const handleCreate = (name: string, template: MailTemplate) =>
    // Adding a template must not change what participants receive. The built-in default stays
    // active until someone chooses otherwise with "Set default".
    persist([...templates, { ...template, id: crypto.randomUUID(), name }], activeId);

  const handleDelete = async (template: GroupEmailTemplate) => {
    // Deleting the default falls back to the built-in message rather than promoting whichever
    // template happens to sort first — nobody chose that one, and the change is invisible.
    const wasActive = activeId === template.id;
    const next = templates.filter((other) => other.id !== template.id);
    if (!(await persist(next, wasActive ? null : activeId))) {
      return;
    }
    setDeleting(null);
    if (wasActive) {
      addNotification({
        message: t({
          en: 'That was the default template, so the built-in message is now used.',
          fr: 'Ce modèle était le modèle par défaut ; le message intégré est désormais utilisé.'
        }),
        type: 'info'
      });
    }
  };

  const handleEditSave = async (updated: GroupEmailTemplate) => {
    const next = templates.map((template) => (template.id === updated.id ? updated : template));
    if (await persist(next, activeId)) {
      setEditing(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" data-testid="group-email-templates">
      <div>
        <Heading className="mb-2" variant="h4">
          {t({ en: 'Remote Assignment Templates', fr: "Modèles d'évaluation à distance" })}
        </Heading>
        <p className="text-muted-foreground mb-3 text-sm">
          {t({
            en: 'Used when emailing a remote assignment link.',
            fr: "Utilisés lors de l'envoi d'un lien d'évaluation à distance."
          })}
        </p>
        <div className="flex flex-col gap-2">
          <TemplateRow
            actions={
              <Button
                aria-label={t({ en: 'View', fr: 'Voir' })}
                data-testid="template-view-builtin"
                size="icon"
                type="button"
                variant="outline"
                onClick={() => setIsViewingDefault(true)}
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
            }
            isActive={activeId === null}
            isPending={updateGroupMutation.isPending}
            label={t({
              en: 'Your Open Data Capture Assignment (built-in)',
              fr: 'Votre évaluation Open Data Capture (intégré)'
            })}
            rowId="builtin"
            onSetActive={() => void persist(templates, null)}
          />
          {templates.map((template) => (
            <TemplateRow
              actions={
                <React.Fragment>
                  <Button
                    aria-label={t({ en: 'Edit', fr: 'Modifier' })}
                    data-testid={`template-edit-${template.id}`}
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(template)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label={t('core.delete')}
                    data-testid={`template-delete-${template.id}`}
                    size="icon"
                    type="button"
                    variant="danger"
                    onClick={() => setDeleting(template)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </React.Fragment>
              }
              isActive={activeId === template.id}
              isPending={updateGroupMutation.isPending}
              key={template.id}
              label={template.name}
              rowId={template.id}
              onSetActive={() => void persist(templates, template.id)}
            />
          ))}
          {templates.length === 0 && (
            <EmptyState>
              {t({
                en: 'No custom templates yet — create one below to override the built-in message.',
                fr: 'Aucun modèle personnalisé — créez-en un ci-dessous pour remplacer le message intégré.'
              })}
            </EmptyState>
          )}
        </div>
      </div>

      <CreateTemplateForm
        isPending={updateGroupMutation.isPending}
        validateContent={validateContent}
        validateName={(name) => validateName(name)}
        onCreate={handleCreate}
      />

      <ViewDefaultTemplateDialog open={isViewingDefault} onOpenChange={setIsViewingDefault} />

      <EditTemplateDialog
        isPending={updateGroupMutation.isPending}
        template={editing}
        validateContent={validateContent}
        validateName={(name) => validateName(name, editing?.id)}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(updated) => void handleEditSave(updated)}
      />

      <DeleteTemplateDialog
        isPending={updateGroupMutation.isPending}
        template={deleting}
        onConfirm={(template) => void handleDelete(template)}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
};
