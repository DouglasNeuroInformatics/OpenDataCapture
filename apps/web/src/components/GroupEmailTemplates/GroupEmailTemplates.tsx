import React from 'react';

import { Button, Dialog, Heading, Input, Label, Select, TextArea } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Group } from '@opendatacapture/schemas/group';
import type { GroupEmailTemplate, GroupEmailTemplateCategory } from '@opendatacapture/schemas/group';
import { checkTemplateIssue, DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { LocalizedString, TemplateIssue } from '@opendatacapture/schemas/mail';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { SaveStatus } from '@/components/SaveStatus';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateGroupMutation } from '@/hooks/useUpdateGroupMutation';
import { useAppStore } from '@/store';
import { ALL_LANGUAGES } from '@/utils/languages';

type ActiveIds = { assignment: null | string; information: null | string };

const AVAILABLE_VARS: { [K in GroupEmailTemplateCategory]: string[] } = {
  INFORMATION: [],
  REMOTE_ASSIGNMENT: ['url', 'expiresAt']
};

const templateIssue = (
  category: GroupEmailTemplateCategory,
  subject: LocalizedString,
  body: LocalizedString,
  languages?: string[]
): TemplateIssue => checkTemplateIssue(subject, body, AVAILABLE_VARS[category], languages);

const templateErrorMessage = (
  t: (value: { en: string; es?: string; fr: string }) => string,
  issue: TemplateIssue
): string | undefined => {
  if (issue === 'incomplete') {
    return t({
      en: 'Fill in the subject and body in each language.',
      fr: "Remplissez l'objet et le corps dans chaque langue."
    });
  }
  if (issue === 'missing-vars') {
    return t({
      en: 'Remote assignment templates must include {{url}} and {{expiresAt}}.',
      fr: "Les modèles d'évaluation à distance doivent inclure {{url}} et {{expiresAt}}."
    });
  }
  return undefined;
};

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="text-muted-foreground rounded-md border border-dashed border-slate-200/80 p-3 text-sm dark:border-slate-700/80">
    {children}
  </div>
);

function getTemplateLangs(body: LocalizedString | null | undefined, fallback: string): string[] {
  if (!body) return [fallback];
  const langs = (Object.keys(body) as (keyof LocalizedString)[]).filter((k) => body[k] != null);
  return langs.length > 0 ? langs : [fallback];
}

const cleanLocalized = (obj: LocalizedString | null | undefined): LocalizedString =>
  Object.fromEntries(Object.entries(obj ?? {}).filter(([, v]) => v));

const TemplateFields = ({
  activeLanguages,
  body,
  category,
  categoryLabel,
  error,
  name,
  setBody,
  setCategory,
  setName,
  setSubject,
  subject
}: {
  activeLanguages: string[];
  body: LocalizedString;
  category: GroupEmailTemplateCategory;
  categoryLabel: (value: GroupEmailTemplateCategory) => string;
  error?: string;
  name: string;
  setBody: (value: LocalizedString) => void;
  setCategory: (value: GroupEmailTemplateCategory) => void;
  setName: (value: string) => void;
  setSubject: (value: LocalizedString) => void;
  subject: LocalizedString;
}) => {
  const { resolvedLanguage, t } = useTranslation();
  const [lang, setLang] = React.useState<string>(
    activeLanguages.includes(resolvedLanguage) ? resolvedLanguage : activeLanguages[0]!
  );
  const bodyCursorRef = React.useRef<null | { end: number; start: number }>(null);

  const currentBody = body[lang as keyof LocalizedString] ?? '';
  const currentSubject = subject[lang as keyof LocalizedString] ?? '';

  return (
    <React.Fragment>
      <div className="flex flex-col gap-1.5">
        <Label>{t({ en: 'Category', fr: 'Catégorie' })}</Label>
        <SegmentedControl<GroupEmailTemplateCategory>
          className="w-full max-w-md"
          options={[
            { label: categoryLabel('REMOTE_ASSIGNMENT'), value: 'REMOTE_ASSIGNMENT' },
            { label: categoryLabel('INFORMATION'), value: 'INFORMATION' }
          ]}
          value={category}
          onChange={setCategory}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tpl-name">{t({ en: 'Name', fr: 'Nom' })}</Label>
        <Input id="tpl-name" value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t({ en: 'Language', fr: 'Langue' })}</Label>
        <Select value={lang} onValueChange={setLang}>
          <Select.Trigger className="w-[180px] border-sky-700 bg-sky-700 text-white hover:bg-sky-800 dark:border-sky-700 dark:bg-sky-700 dark:text-white dark:hover:bg-sky-800">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {activeLanguages.map((code) => (
                <Select.Item key={code} value={code}>
                  {ALL_LANGUAGES[code] ?? code}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tpl-subject">{t({ en: 'Subject', fr: 'Objet' })}</Label>
        <Input
          id="tpl-subject"
          value={currentSubject}
          onChange={(event) => setSubject({ ...subject, [lang]: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="tpl-body">{t({ en: 'Body', fr: 'Corps' })}</Label>
          {AVAILABLE_VARS[category].length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-xs">{t({ en: 'Insert:', fr: 'Insérer :' })}</span>
              {AVAILABLE_VARS[category].map((variable) => (
                <Button
                  className="h-6 px-2 font-mono text-xs"
                  key={variable}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tag = `{{${variable}}}`;
                    const cursor = bodyCursorRef.current;
                    if (cursor === null) {
                      setBody({ ...body, [lang]: currentBody.length > 0 ? `${currentBody} ${tag}` : tag });
                    } else {
                      const next = currentBody.slice(0, cursor.start) + tag + currentBody.slice(cursor.end);
                      bodyCursorRef.current = { end: cursor.start + tag.length, start: cursor.start + tag.length };
                      setBody({ ...body, [lang]: next });
                    }
                  }}
                >
                  {`{{${variable}}}`}
                </Button>
              ))}
            </div>
          )}
        </div>
        <TextArea
          id="tpl-body"
          rows={8}
          value={currentBody}
          onBlur={(event) => {
            const el = event.currentTarget;
            bodyCursorRef.current = { end: el.selectionEnd, start: el.selectionStart };
          }}
          onChange={(event) => setBody({ ...body, [lang]: event.target.value })}
        />
        {error && <p className="text-destructive text-xs font-medium">{error}</p>}
      </div>
    </React.Fragment>
  );
};

const EditTemplateForm = ({
  activeLanguages,
  categoryLabel,
  existingTemplates,
  isPending,
  onCancel,
  onSave,
  template
}: {
  activeLanguages: string[];
  categoryLabel: (value: GroupEmailTemplateCategory) => string;
  existingTemplates: GroupEmailTemplate[];
  isPending: boolean;
  onCancel: () => void;
  onSave: (template: GroupEmailTemplate) => Promise<void> | void;
  template: GroupEmailTemplate;
}) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [category, setCategory] = React.useState(template.category);
  const [name, setName] = React.useState(template.name);
  const [subject, setSubject] = React.useState<LocalizedString>(template.subject ?? {});
  const [body, setBody] = React.useState<LocalizedString>(template.body ?? {});

  const templateLangs = getTemplateLangs(body, activeLanguages[0]!);
  const bodyError = templateErrorMessage(t, templateIssue(category, subject, body, templateLangs));

  const duplicateNameMessage = t({
    en: 'A template with this name already exists',
    fr: 'Un modèle avec ce nom existe déjà'
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      addNotification({
        message: t({ en: 'A name is required', fr: 'Un nom est requis' }),
        type: 'error'
      });
      return;
    }
    const isDuplicate = existingTemplates.some(
      (tpl) => tpl.id !== template.id && tpl.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicate) {
      addNotification({ message: duplicateNameMessage, type: 'error' });
      return;
    }
    if (bodyError) {
      return;
    }
    void onSave({ ...template, body, category, name: name.trim(), subject });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <TemplateFields
        activeLanguages={activeLanguages}
        body={body}
        category={category}
        categoryLabel={categoryLabel}
        error={bodyError}
        name={name}
        setBody={setBody}
        setCategory={setCategory}
        setName={setName}
        setSubject={setSubject}
        subject={subject}
      />
      <Dialog.Footer>
        <Button className="flex-1" type="button" variant="outline" onClick={onCancel}>
          {t('core.cancel')}
        </Button>
        <Button className="flex-1" disabled={isPending || Boolean(bodyError)} type="submit">
          {t('core.save')}
        </Button>
      </Dialog.Footer>
    </form>
  );
};

export const GroupEmailTemplates = () => {
  const { resolvedLanguage, t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  const groupId = currentGroup?.id;
  const queryClient = useQueryClient();
  const updateGroupMutation = useUpdateGroupMutation();
  const setupStateQuery = useSetupStateQuery();
  const activeLanguages = setupStateQuery.data.activeLanguages ?? ['en', 'fr'];

  const [saveState, setSaveState] = React.useState<'idle' | 'saved' | 'saving'>('idle');
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => {
    if (updateGroupMutation.isPending) {
      setSaveState('saving');
    } else if (updateGroupMutation.isSuccess) {
      setSaveState('saved');
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveState('idle'), 2000);
    }
  }, [updateGroupMutation.isPending, updateGroupMutation.isSuccess]);

  const groupQuery = useQuery({
    enabled: Boolean(groupId),
    queryFn: async () => $Group.parseAsync((await axios.get(`/v1/groups/${groupId}`)).data),
    queryKey: ['group', groupId]
  });

  const templates = groupQuery.data?.emailTemplates ?? [];
  const activeIds: ActiveIds = {
    assignment: groupQuery.data?.activeAssignmentEmailTemplateId ?? null,
    information: groupQuery.data?.activeInformationTemplateId ?? null
  };

  const firstLang = activeLanguages.includes(resolvedLanguage) ? resolvedLanguage : activeLanguages[0]!;
  const [category, setCategory] = React.useState<GroupEmailTemplateCategory>('REMOTE_ASSIGNMENT');
  const [name, setName] = React.useState('');
  const [subject, setSubject] = React.useState<LocalizedString>({ [firstLang]: '' } as LocalizedString);
  const [body, setBody] = React.useState<LocalizedString>({ [firstLang]: '' } as LocalizedString);

  const [editing, setEditing] = React.useState<GroupEmailTemplate | null>(null);
  const [viewingDefault, setViewingDefault] = React.useState(false);
  const [confirmCreate, setConfirmCreate] = React.useState(false);

  const categoryLabel = (value: GroupEmailTemplateCategory) =>
    value === 'REMOTE_ASSIGNMENT'
      ? t({ en: 'Remote assignment', fr: 'Évaluation à distance' })
      : t({ en: 'Information', fr: 'Information' });

  const activeIdFor = (value: GroupEmailTemplateCategory) =>
    value === 'REMOTE_ASSIGNMENT' ? activeIds.assignment : activeIds.information;

  const persist = async (next: GroupEmailTemplate[], actives: ActiveIds) => {
    const cleaned = next.map((tpl) => ({
      ...tpl,
      body: cleanLocalized(tpl.body),
      subject: cleanLocalized(tpl.subject)
    }));
    await updateGroupMutation.mutateAsync({
      activeAssignmentEmailTemplateId: actives.assignment,
      activeInformationTemplateId: actives.information,
      emailTemplates: cleaned
    });
    await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
  };

  const createTemplateLangs = getTemplateLangs(body, firstLang);

  const doCreate = async () => {
    const id = crypto.randomUUID();
    const next = [...templates, { body, category, id, name: name.trim(), subject }];
    const actives: ActiveIds = {
      assignment: category === 'REMOTE_ASSIGNMENT' ? (activeIds.assignment ?? id) : activeIds.assignment,
      information: category === 'INFORMATION' ? (activeIds.information ?? id) : activeIds.information
    };
    await persist(next, actives);
    setCategory('REMOTE_ASSIGNMENT');
    setName('');
    setSubject({ [firstLang]: '' });
    setBody({ [firstLang]: '' });
    document.querySelector('.overflow-y-scroll')?.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const missingLanguages = activeLanguages.filter((lang) => !body[lang as keyof LocalizedString]?.trim());

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      addNotification({
        message: t({ en: 'A name is required', fr: 'Un nom est requis' }),
        type: 'error'
      });
      return;
    }
    const isDuplicate = templates.some((tpl) => tpl.name.toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) {
      addNotification({
        message: t({
          en: 'A template with this name already exists',
          fr: 'Un modèle avec ce nom existe déjà'
        }),
        type: 'error'
      });
      return;
    }
    if (templateIssue(category, subject, body, createTemplateLangs) !== null) {
      return;
    }
    if (missingLanguages.length > 0) {
      setConfirmCreate(true);
      return;
    }
    await doCreate();
  };

  const handleSetActive = async (tpl: GroupEmailTemplate) => {
    await persist(templates, {
      assignment: tpl.category === 'REMOTE_ASSIGNMENT' ? tpl.id : activeIds.assignment,
      information: tpl.category === 'INFORMATION' ? tpl.id : activeIds.information
    });
  };

  const handleDelete = async (tpl: GroupEmailTemplate) => {
    const next = templates.filter((other) => other.id !== tpl.id);
    const actives: ActiveIds = {
      assignment:
        activeIds.assignment === tpl.id
          ? (next.find((other) => other.category === 'REMOTE_ASSIGNMENT')?.id ?? null)
          : activeIds.assignment,
      information:
        activeIds.information === tpl.id
          ? (next.find((other) => other.category === 'INFORMATION')?.id ?? null)
          : activeIds.information
    };
    await persist(next, actives);
  };

  const handleEditSave = async (updated: GroupEmailTemplate) => {
    const next = templates.map((tpl) => (tpl.id === updated.id ? updated : tpl));
    await persist(next, activeIds);
    setEditing(null);
  };

  const renderTemplate = (tpl: GroupEmailTemplate) => {
    const isActive = activeIdFor(tpl.category) === tpl.id;
    return (
      <div
        className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200/60 p-2 dark:border-slate-700/60"
        key={tpl.id}
      >
        <span className="flex-1 text-sm font-medium">{tpl.name}</span>
        <Button
          aria-label={t({ en: 'Edit', fr: 'Modifier' })}
          size="icon"
          type="button"
          variant="outline"
          onClick={() => setEditing(tpl)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label={t('core.delete')}
          size="icon"
          type="button"
          variant="danger"
          onClick={() => void handleDelete(tpl)}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
        {isActive ? (
          <Button
            className="pointer-events-none w-28 justify-center border-transparent bg-green-700 text-white hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-800"
            size="sm"
            tabIndex={-1}
            type="button"
            variant="primary"
          >
            {t({ en: 'Default', fr: 'Par défaut' })}
          </Button>
        ) : (
          <Button
            className="w-28 justify-center"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => void handleSetActive(tpl)}
          >
            {t({ en: 'Set default', fr: 'Définir par défaut' })}
          </Button>
        )}
      </div>
    );
  };

  const renderDefaultAssignmentTemplate = () => {
    const isActive = activeIds.assignment === null;
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200/60 p-2 dark:border-slate-700/60">
        <span className="flex-1 text-sm font-medium">
          {t({
            en: 'Your Open Data Capture Assignment (built-in)',
            fr: 'Votre évaluation Open Data Capture (intégré)'
          })}
        </span>
        <Button
          aria-label={t({ en: 'View', fr: 'Voir' })}
          size="icon"
          type="button"
          variant="outline"
          onClick={() => setViewingDefault(true)}
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
        {isActive ? (
          <Button
            className="pointer-events-none w-28 justify-center border-transparent bg-green-700 text-white hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-800"
            size="sm"
            tabIndex={-1}
            type="button"
            variant="primary"
          >
            {t({ en: 'Default', fr: 'Par défaut' })}
          </Button>
        ) : (
          <Button
            className="w-28 justify-center"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => void persist(templates, { assignment: null, information: activeIds.information })}
          >
            {t({ en: 'Set default', fr: 'Définir par défaut' })}
          </Button>
        )}
      </div>
    );
  };

  const remoteAssignmentTemplates = templates.filter((tpl) => tpl.category === 'REMOTE_ASSIGNMENT');
  const informationTemplates = templates.filter((tpl) => tpl.category === 'INFORMATION');

  const createBodyError = templateErrorMessage(t, templateIssue(category, subject, body, createTemplateLangs));

  const defaultTemplateBody = DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body as { [key: string]: string | undefined };
  const defaultTemplateSubject = DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject as { [key: string]: string | undefined };
  const defaultTemplateLangs = activeLanguages.filter((k) => defaultTemplateBody[k]);
  const [defaultViewLang, setDefaultViewLang] = React.useState(firstLang);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Heading className="mb-2" variant="h4">
          {t({
            en: 'Remote Assignment Templates',
            fr: "Modèles d'évaluation à distance"
          })}
        </Heading>
        <p className="text-muted-foreground mb-3 text-sm">
          {t({
            en: 'Used when emailing a remote assignment link.',
            fr: "Utilisés lors de l'envoi d'un lien d'évaluation à distance."
          })}
        </p>
        <div className="flex flex-col gap-2">
          {renderDefaultAssignmentTemplate()}
          {remoteAssignmentTemplates.map(renderTemplate)}
        </div>
      </div>

      <div>
        <Heading className="mb-2" variant="h4">
          {t({ en: 'Information Templates', fr: "Modèles d'information" })}
        </Heading>
        <p className="text-muted-foreground mb-3 text-sm">
          {t({
            en: 'General study-related messages for your participants.',
            fr: "Messages généraux liés à l'étude pour vos participants."
          })}
        </p>
        {informationTemplates.length > 0 ? (
          <div className="flex flex-col gap-2">{informationTemplates.map(renderTemplate)}</div>
        ) : (
          <EmptyState>
            {t({
              en: 'No information templates yet — create one to get started.',
              fr: "Aucun modèle d'information — créez-en un pour commencer."
            })}
          </EmptyState>
        )}
      </div>

      <form
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 p-5 dark:border-slate-700/60"
        onSubmit={(event) => void handleCreate(event)}
      >
        <Heading variant="h5">{t({ en: 'New template', fr: 'Nouveau modèle' })}</Heading>
        <TemplateFields
          activeLanguages={activeLanguages}
          body={body}
          category={category}
          categoryLabel={categoryLabel}
          error={createBodyError}
          name={name}
          setBody={setBody}
          setCategory={setCategory}
          setName={setName}
          setSubject={setSubject}
          subject={subject}
        />
        <div>
          <Button disabled={updateGroupMutation.isPending || Boolean(createBodyError)} type="submit">
            {t({ en: 'Add template', fr: 'Ajouter le modèle' })}
          </Button>
        </div>
      </form>

      <Dialog open={viewingDefault} onOpenChange={setViewingDefault}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Built-in default template',
                fr: 'Modèle par défaut intégré'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'This is the message sent for remote assignments when no custom template is active.',
                fr: "Il s'agit du message envoyé pour les évaluations à distance lorsqu'aucun modèle personnalisé n'est actif."
              })}
            </Dialog.Description>
          </Dialog.Header>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t({ en: 'Language', fr: 'Langue' })}</Label>
              <Select value={defaultViewLang} onValueChange={setDefaultViewLang}>
                <Select.Trigger className="w-[180px] border-sky-700 bg-sky-700 text-white hover:bg-sky-800 dark:border-sky-700 dark:bg-sky-700 dark:text-white dark:hover:bg-sky-800">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {defaultTemplateLangs.map((code) => (
                      <Select.Item key={code} value={code}>
                        {ALL_LANGUAGES[code] ?? code}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="default-tpl-subject">{t({ en: 'Subject', fr: 'Objet' })}</Label>
              <Input readOnly id="default-tpl-subject" value={defaultTemplateSubject[defaultViewLang] ?? ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="default-tpl-body">{t({ en: 'Body', fr: 'Corps' })}</Label>
              <TextArea readOnly id="default-tpl-body" rows={8} value={defaultTemplateBody[defaultViewLang] ?? ''} />
            </div>
          </div>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={() => setViewingDefault(false)}>
              {t({ en: 'Close', fr: 'Fermer' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Edit template', fr: 'Modifier le modèle' })}</Dialog.Title>
          </Dialog.Header>
          {editing && (
            <EditTemplateForm
              activeLanguages={activeLanguages}
              categoryLabel={categoryLabel}
              existingTemplates={templates}
              isPending={updateGroupMutation.isPending}
              template={editing}
              onCancel={() => setEditing(null)}
              onSave={handleEditSave}
            />
          )}
        </Dialog.Content>
      </Dialog>
      <SaveStatus state={saveState} />

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
              { args: [missingLanguages.map((code) => ALL_LANGUAGES[code] ?? code).join(', ')] }
            )}
          </Dialog.Description>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={() => setConfirmCreate(false)}>
              {t('core.cancel')}
            </Button>
            <Button
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
