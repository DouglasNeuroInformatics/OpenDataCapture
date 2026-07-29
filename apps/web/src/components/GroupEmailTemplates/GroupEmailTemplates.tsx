import React from 'react';

import { Button, Dialog, Heading, Input, Label } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { LocalizedString } from '@opendatacapture/schemas/core';
import type { GroupEmailTemplate } from '@opendatacapture/schemas/group';
import { checkTemplateIssue, DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { MailTemplate, TemplateIssue } from '@opendatacapture/schemas/mail';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { EmailTemplateEditor, LANGUAGE_LABELS, LANGUAGES } from '@/components/EmailTemplateEditor';
import { GROUP_QUERY_KEY, useGroupQuery } from '@/hooks/useGroupQuery';
import { useUpdateGroupMutation } from '@/hooks/useUpdateGroupMutation';
import { useAppStore } from '@/store';

const ASSIGNMENT_VARS = ['url', 'expiresAt'] as const;

const emptyTemplate = (): MailTemplate => ({ body: {}, subject: {} });

const cleanLocalized = (value: LocalizedString | null | undefined): LocalizedString =>
  Object.fromEntries(Object.entries(value ?? {}).filter(([, text]) => text));

/** The languages a template has any body text in; used to scope validation to what was authored. */
const authoredLanguages = (body: LocalizedString): string[] =>
  LANGUAGES.filter((code) => body[code]?.trim()).map(String);

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="text-muted-foreground border-border rounded-md border border-dashed p-3 text-sm">{children}</div>
);

const ViewDefaultTemplateDialog = ({
  onOpenChange,
  open
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Built-in default template', fr: 'Modèle par défaut intégré' })}</Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'This is the message sent for remote assignments when no custom template is active.',
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

const EditTemplateForm = ({
  isDuplicateName,
  isPending,
  onCancel,
  onSave,
  template,
  validate
}: {
  isDuplicateName: (name: string) => boolean;
  isPending: boolean;
  onCancel: () => void;
  onSave: (template: GroupEmailTemplate) => Promise<void>;
  template: GroupEmailTemplate;
  validate: (template: MailTemplate) => string | undefined;
}) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [name, setName] = React.useState(template.name);
  const [draft, setDraft] = React.useState<MailTemplate>({
    body: template.body ?? {},
    subject: template.subject ?? {}
  });

  const error = validate(draft);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      addNotification({ message: t({ en: 'A name is required', fr: 'Un nom est requis' }), type: 'error' });
      return;
    }
    if (isDuplicateName(name)) {
      addNotification({
        message: t({ en: 'A template with this name already exists', fr: 'Un modèle avec ce nom existe déjà' }),
        type: 'error'
      });
      return;
    }
    if (error) {
      return;
    }
    void onSave({ ...template, ...draft, name: name.trim() });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="template-edit-name">{t({ en: 'Name', fr: 'Nom' })}</Label>
        <Input
          data-testid="template-edit-name"
          id="template-edit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <EmailTemplateEditor
        error={error}
        idPrefix="template-edit"
        template={draft}
        variables={ASSIGNMENT_VARS}
        onChange={setDraft}
      />
      <Dialog.Footer>
        <Button className="flex-1" type="button" variant="outline" onClick={onCancel}>
          {t('core.cancel')}
        </Button>
        <Button
          className="flex-1"
          data-testid="template-edit-save"
          disabled={isPending || Boolean(error)}
          type="submit"
        >
          {t('core.save')}
        </Button>
      </Dialog.Footer>
    </form>
  );
};

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

  const [name, setName] = React.useState('');
  const [draft, setDraft] = React.useState<MailTemplate>(emptyTemplate);
  const [editing, setEditing] = React.useState<GroupEmailTemplate | null>(null);
  const [deleting, setDeleting] = React.useState<GroupEmailTemplate | null>(null);
  const [viewingDefault, setViewingDefault] = React.useState(false);
  const [confirmCreate, setConfirmCreate] = React.useState(false);
  const createFormRef = React.useRef<HTMLFormElement>(null);

  const templateError = (issue: TemplateIssue): string | undefined => {
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

  const validate = (template: MailTemplate): string | undefined =>
    templateError(
      checkTemplateIssue(template.subject, template.body, ASSIGNMENT_VARS, authoredLanguages(template.body))
    );

  /**
   * Replace the group's whole template list. `expectedUpdatedAt` pins the revision this edit was
   * composed against, so a concurrent edit by another manager is rejected rather than overwritten.
   */
  const persist = async (next: GroupEmailTemplate[], nextActiveId: null | string): Promise<boolean> => {
    if (!group) {
      return false;
    }
    try {
      await updateGroupMutation.mutateAsync({
        activeAssignmentEmailTemplateId: nextActiveId,
        emailTemplates: next.map((template) => ({
          ...template,
          body: cleanLocalized(template.body),
          subject: cleanLocalized(template.subject)
        })),
        expectedUpdatedAt: group.updatedAt
      });
      await queryClient.invalidateQueries({ queryKey: [GROUP_QUERY_KEY, groupId] });
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
        await queryClient.invalidateQueries({ queryKey: [GROUP_QUERY_KEY, groupId] });
      }
      return false;
    }
  };

  const isDuplicateName = (candidate: string, exceptId?: string) =>
    templates.some(
      (template) => template.id !== exceptId && template.name.toLowerCase() === candidate.trim().toLowerCase()
    );

  const doCreate = async () => {
    const id = crypto.randomUUID();
    const created: GroupEmailTemplate = { ...draft, id, name: name.trim() };
    const saved = await persist([...templates, created], activeId ?? id);
    if (!saved) {
      return;
    }
    setName('');
    setDraft(emptyTemplate());
    createFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const missingLanguages = LANGUAGES.filter((code) => !draft.body[code]?.trim());
  const createError = validate(draft);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      addNotification({ message: t({ en: 'A name is required', fr: 'Un nom est requis' }), type: 'error' });
      return;
    }
    if (isDuplicateName(name)) {
      addNotification({
        message: t({ en: 'A template with this name already exists', fr: 'Un modèle avec ce nom existe déjà' }),
        type: 'error'
      });
      return;
    }
    if (createError) {
      return;
    }
    if (missingLanguages.length > 0) {
      setConfirmCreate(true);
      return;
    }
    await doCreate();
  };

  const handleDelete = async (template: GroupEmailTemplate) => {
    const next = templates.filter((other) => other.id !== template.id);
    const nextActiveId = activeId === template.id ? (next[0]?.id ?? null) : activeId;
    if (await persist(next, nextActiveId)) {
      setDeleting(null);
    }
  };

  const handleEditSave = async (updated: GroupEmailTemplate) => {
    const next = templates.map((template) => (template.id === updated.id ? updated : template));
    if (await persist(next, activeId)) {
      setEditing(null);
    }
  };

  const renderRow = (
    key: string,
    label: string,
    isActive: boolean,
    actions: React.ReactNode,
    onSetActive: () => void
  ) => (
    <div className="border-border flex flex-wrap items-center gap-2 rounded-md border p-2" key={key}>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {actions}
      {isActive ? (
        <span
          className="bg-primary text-primary-foreground w-28 rounded-md py-1.5 text-center text-sm font-medium"
          data-testid={`template-active-${key}`}
        >
          {t({ en: 'Default', fr: 'Par défaut' })}
        </span>
      ) : (
        <Button
          className="w-28 justify-center"
          data-testid={`template-set-active-${key}`}
          disabled={updateGroupMutation.isPending}
          size="sm"
          type="button"
          variant="outline"
          onClick={onSetActive}
        >
          {t({ en: 'Set default', fr: 'Définir par défaut' })}
        </Button>
      )}
    </div>
  );

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
          {renderRow(
            'builtin',
            t({
              en: 'Your Open Data Capture Assignment (built-in)',
              fr: 'Votre évaluation Open Data Capture (intégré)'
            }),
            activeId === null,
            <Button
              aria-label={t({ en: 'View', fr: 'Voir' })}
              data-testid="template-view-builtin"
              size="icon"
              type="button"
              variant="outline"
              onClick={() => setViewingDefault(true)}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>,
            () => void persist(templates, null)
          )}
          {templates.map((template) =>
            renderRow(
              template.id,
              template.name,
              activeId === template.id,
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
              </React.Fragment>,
              () => void persist(templates, template.id)
            )
          )}
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

      <form
        className="border-border flex flex-col gap-3 rounded-2xl border p-5"
        data-testid="template-create-form"
        ref={createFormRef}
        onSubmit={(event) => void handleCreate(event)}
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
          error={createError}
          idPrefix="template-create"
          template={draft}
          variables={ASSIGNMENT_VARS}
          onChange={setDraft}
        />
        <div>
          <Button
            data-testid="template-create-submit"
            disabled={updateGroupMutation.isPending || Boolean(createError)}
            type="submit"
          >
            {t({ en: 'Add template', fr: 'Ajouter le modèle' })}
          </Button>
        </div>
      </form>

      <ViewDefaultTemplateDialog open={viewingDefault} onOpenChange={setViewingDefault} />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Edit template', fr: 'Modifier le modèle' })}</Dialog.Title>
          </Dialog.Header>
          {editing && (
            <EditTemplateForm
              isDuplicateName={(candidate) => isDuplicateName(candidate, editing.id)}
              isPending={updateGroupMutation.isPending}
              template={editing}
              validate={validate}
              onCancel={() => setEditing(null)}
              onSave={handleEditSave}
            />
          )}
        </Dialog.Content>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Delete template', fr: 'Supprimer le modèle' })}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Description>
            {t(
              {
                en: 'Permanently delete "{}"? This cannot be undone.',
                fr: 'Supprimer définitivement « {} » ? Cette action est irréversible.'
              },
              { args: [deleting?.name ?? ''] }
            )}
          </Dialog.Description>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
              {t('core.cancel')}
            </Button>
            <Button
              data-testid="template-delete-confirm"
              disabled={updateGroupMutation.isPending}
              type="button"
              variant="danger"
              onClick={() => deleting && void handleDelete(deleting)}
            >
              {t('core.delete')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog open={confirmCreate} onOpenChange={setConfirmCreate}>
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
            <Button type="button" variant="outline" onClick={() => setConfirmCreate(false)}>
              {t('core.cancel')}
            </Button>
            <Button
              data-testid="template-create-anyway"
              type="button"
              variant="primary"
              onClick={() => {
                setConfirmCreate(false);
                void doCreate();
              }}
            >
              {t({ en: 'Add anyway', fr: 'Ajouter quand même' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
