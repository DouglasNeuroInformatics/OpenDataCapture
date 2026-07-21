import React, { useMemo, useState } from 'react';

import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Form,
  Heading,
  Input,
  SearchBar,
  Spinner,
  TextArea
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/react-core';
import type { ScalarInstrumentInternal } from '@opendatacapture/runtime-core';
import { $RegexString } from '@opendatacapture/schemas/core';
import type { UpdateGroupData } from '@opendatacapture/schemas/group';
import type { $CreateSeriesInstrumentData } from '@opendatacapture/schemas/instrument';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import { EyeIcon, TrashIcon } from 'lucide-react';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useCreateSeriesInstrumentMutation } from '@/hooks/useCreateSeriesInstrumentMutation';
import { useDeleteSeriesInstrumentMutation } from '@/hooks/useDeleteSeriesInstrumentMutation';
import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateGroupMutation } from '@/hooks/useUpdateGroupMutation';
import { useAppStore } from '@/store';

type InstrumentSource = { kind: 'manual' } | { kind: 'repo'; name: string };

type InstrumentItem = {
  authors?: null | string[];
  description?: string;
  id: string;
  // The scalar instrument identity (name + edition); null for series instruments, which have no edition.
  internal: null | ScalarInstrumentInternal;
  kind: string;
  seriesItems?: { id: string }[];
  source: InstrumentSource;
  title: string;
};

type CategorizedInstruments = {
  form: InstrumentItem[];
  interactive: InstrumentItem[];
  series: InstrumentItem[];
};

const getSeriesPreviewItemTitles = ({
  fallbackTitle,
  items,
  seriesItems
}: {
  fallbackTitle: (index: number) => string;
  items: InstrumentItem[];
  seriesItems: { id: string }[];
}) => {
  return seriesItems.map((seriesItem, index) => {
    return items.find((item) => item.id === seriesItem.id)?.title ?? fallbackTitle(index);
  });
};

const expandSelectedSeriesIds = ({ selectedIds, series }: { selectedIds: Set<string>; series: InstrumentItem[] }) => {
  const expandedIds = new Set(selectedIds);
  for (const item of series) {
    if (!selectedIds.has(item.id)) {
      continue;
    }
    for (const seriesItem of item.seriesItems ?? []) {
      expandedIds.add(seriesItem.id);
    }
  }
  return expandedIds;
};

type SettingsValues = {
  defaultIdentificationMethod?: SubjectIdentificationMethod;
  idValidationRegex?: null | string;
  idValidationRegexErrorMessageEn?: null | string;
  idValidationRegexErrorMessageFr?: null | string;
  minimumAge?: null | number;
  minimumAgeApplied?: boolean | null;
  subjectIdDisplayLength?: null | number;
};

type ManageGroupFormProps = {
  data: {
    // The titles of every visible instrument, used to enforce unique new series instrument names.
    existingTitles: string[];
    groupId: string;
    // Accessible instrument ids that are not in the visible list; preserved as-is on save.
    hiddenAccessibleIds: string[];
    initialSelectedIds: string[];
    instruments: CategorizedInstruments;
    settingsInitialValues: SettingsValues;
  };
  onSubmit: (data: Partial<UpdateGroupData>) => Promisable<any>;
  readOnly: boolean;
};

const InstrumentSection = ({
  items,
  onDelete,
  onPreview,
  onToggle,
  readOnly,
  search,
  selectedIds,
  title
}: {
  items: InstrumentItem[];
  // When provided, a delete affordance is shown for items where it returns true.
  onDelete?: (item: InstrumentItem) => void;
  onPreview: (item: InstrumentItem) => void;
  onToggle: (id: string) => void;
  readOnly: boolean;
  search: string;
  selectedIds: Set<string>;
  title: string;
}) => {
  const { t } = useTranslation();
  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(lower));
  }, [items, search]);

  return (
    <div className="mb-6">
      {title && <h3 className="mb-2 text-sm font-semibold">{title}</h3>}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">
          {t({ en: 'No instruments available.', fr: 'Aucun instrument disponible.' })}
        </p>
      ) : (
        <div className="space-y-1">
          {filtered.map((item) => (
            <div
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
              key={item.id}
            >
              <Checkbox
                checked={selectedIds.has(item.id)}
                disabled={readOnly}
                onCheckedChange={() => onToggle(item.id)}
              />
              <button
                className="cursor-pointer truncate bg-transparent p-0 text-left text-sm disabled:cursor-default"
                disabled={readOnly}
                title={item.title}
                type="button"
                onClick={() => onToggle(item.id)}
              >
                {item.title}
              </button>
              <Badge className="shrink-0" variant={item.source.kind === 'repo' ? 'secondary' : 'outline'}>
                {item.source.kind === 'repo' ? item.source.name : t({ en: 'No repo', fr: 'Aucun dépôt' })}
              </Badge>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  aria-label={t({ en: 'Preview instrument', fr: "Aperçu de l'instrument" })}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(item);
                  }}
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                {onDelete && !readOnly && item.source.kind === 'manual' && (
                  <button
                    aria-label={t({ en: 'Delete instrument', fr: "Supprimer l'instrument" })}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const InstrumentPreviewDialog = ({
  item,
  items,
  onClose
}: {
  item: InstrumentItem;
  items: InstrumentItem[];
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  // Only the rendered preview needs the bundle. Series composition comes from `item.seriesItems`, which
  // the info query already provides — fetching the bundle for it would pull down the compiled source of
  // every constituent instrument just to list their names.
  const bundleQuery = useInstrumentBundle(showForm ? item.id : null);
  // Passed to the renderer as a localizable value; the shared component resolves it to the active language.
  const previewSubmitLabel = { en: 'Preview Submit', fr: 'Soumettre l’aperçu' };
  const seriesItemTitles = useMemo(() => {
    return getSeriesPreviewItemTitles({
      fallbackTitle: (index) => t({ en: `Item ${index + 1}`, fr: `Élément ${index + 1}` }),
      items,
      seriesItems: item.seriesItems ?? []
    });
  }, [item.seriesItems, items, t]);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className={showForm ? 'sm:max-w-[800px]' : 'max-h-[85vh] sm:max-w-[560px]'}>
        <Dialog.Header>
          <Dialog.Title>{item.title}</Dialog.Title>
        </Dialog.Header>
        {showForm ? (
          <div className="max-h-[70vh] overflow-auto">
            {bundleQuery.isLoading && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}
            {bundleQuery.isError && (
              <p className="text-destructive py-4 text-center text-sm">
                {t({
                  en: 'Failed to load instrument preview.',
                  fr: "Échec du chargement de l'aperçu de l'instrument."
                })}
              </p>
            )}
            {bundleQuery.data && (
              <InstrumentRenderer
                submitButtonLabel={previewSubmitLabel}
                target={bundleQuery.data}
                onSubmit={() => {
                  // Intentionally does nothing: previews can advance without creating records.
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex max-h-[70vh] flex-col text-sm">
            <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
              <div>
                <span className="font-medium">{t({ en: 'Kind', fr: 'Type' })}: </span>
                <span className="text-muted-foreground">{item.kind}</span>
              </div>
              {item.kind === 'SERIES' && (
                <div>
                  <span className="font-medium">
                    {t({ en: 'Series order', fr: 'Ordre de la série' })}
                    {seriesItemTitles.length > 0 && ` (${seriesItemTitles.length})`}:{' '}
                  </span>
                  {seriesItemTitles.length === 0 ? (
                    <span className="text-muted-foreground">
                      {t({ en: 'No items in this series.', fr: 'Aucun élément dans cette série.' })}
                    </span>
                  ) : (
                    <ol className="text-muted-foreground mt-1 max-h-48 list-decimal space-y-1 overflow-auto rounded-md border border-slate-200 py-2 pl-8 pr-3 dark:border-slate-800">
                      {seriesItemTitles.map((title, index) => (
                        <li className="break-words" key={`${title}-${index}`}>
                          {title}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
              {item.authors && item.authors.length > 0 && (
                <div>
                  <span className="font-medium">{t({ en: 'Authors', fr: 'Auteurs' })}: </span>
                  <span className="text-muted-foreground">{item.authors.join(', ')}</span>
                </div>
              )}
              {item.description && (
                <div>
                  <span className="font-medium">{t({ en: 'Description', fr: 'Description' })}: </span>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
              )}
              <div>
                <span className="font-medium">{t({ en: 'Source', fr: 'Source' })}: </span>
                <span className="text-muted-foreground">
                  {item.source.kind === 'repo' ? item.source.name : t({ en: 'No repo', fr: 'Aucun dépôt' })}
                </span>
              </div>
            </div>
            <div className="mt-3 flex shrink-0 justify-center border-t border-slate-200 pt-3 dark:border-slate-800">
              <Button onClick={() => setShowForm(true)}>{t({ en: 'Preview Form', fr: 'Aperçu du formulaire' })}</Button>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

const CreateSeriesInstrumentDialog = ({
  existingTitles,
  forms,
  groupId,
  onClose,
  onCreated
}: {
  existingTitles: string[];
  forms: InstrumentItem[];
  groupId: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}) => {
  const { resolvedLanguage, t } = useTranslation();
  const createMutation = useCreateSeriesInstrumentMutation();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [search, setSearch] = useState('');
  // Ordered list of selected instrument ids — order determines the sequence of the series.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Set when the server reports another series already uses the same forms; holds that series' name so
  // we can ask the user whether they really want to create a duplicate.
  const [duplicateOf, setDuplicateOf] = useState<null | string>(null);

  // Only scalar instruments (which carry a name + edition) can be assembled into a series.
  const selectableForms = useMemo(() => forms.filter((form) => form.internal !== null), [forms]);

  const filteredForms = useMemo(() => {
    if (!search) return selectableForms;
    const lower = search.toLowerCase();
    return selectableForms.filter((form) => form.title.toLowerCase().includes(lower));
  }, [selectableForms, search]);

  const normalizedTitle = title.trim().toLowerCase();
  const titleTaken = useMemo(
    () => existingTitles.some((existing) => existing.trim().toLowerCase() === normalizedTitle),
    [existingTitles, normalizedTitle]
  );

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const canCreate = title.trim().length > 0 && !titleTaken && selectedIds.length >= 2 && !createMutation.isPending;

  const buildItems = () =>
    selectedIds
      .map((id) => selectableForms.find((form) => form.id === id)?.internal)
      .filter((internal): internal is ScalarInstrumentInternal => internal !== null && internal !== undefined);

  // The series is authored in the creator's current language, so the details/instructions are stored as
  // plain (unilingual) strings tagged with that language — the same shape any instrument would use.
  const buildPayload = (items: ScalarInstrumentInternal[]): $CreateSeriesInstrumentData => ({
    clientDetails: instructions.trim() ? { instructions: [instructions.trim()] } : undefined,
    details: { title: title.trim() },
    groupId,
    items,
    language: resolvedLanguage
  });

  const handleCreate = async () => {
    const items = buildItems();
    if (items.length < 2) {
      return;
    }
    // Failures are surfaced by the mutation's onError notification; catch here so the rejection does
    // not escape the void call site, and leave the dialog open for retry.
    try {
      const result = await createMutation.mutateAsync(buildPayload(items));
      if (result.outcome === 'duplicate') {
        // The existing title comes back in its stored form (a plain string, or multilingual object).
        setDuplicateOf(typeof result.existingTitle === 'string' ? result.existingTitle : t(result.existingTitle));
        return;
      }
      onCreated(result.instrumentId);
      onClose();
    } catch {
      // no-op: notification already shown by the mutation's onError
    }
  };

  const handleConfirmDuplicate = async () => {
    const items = buildItems();
    if (items.length < 2) {
      return;
    }
    try {
      const result = await createMutation.mutateAsync({ ...buildPayload(items), confirmDuplicate: true });
      if (result.outcome === 'created') {
        onCreated(result.instrumentId);
      }
      onClose();
    } catch {
      // no-op: notification already shown by the mutation's onError; dialog stays open for retry
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Dialog.Content className="sm:max-w-[600px]">
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Create Series Instrument', fr: 'Créer un instrument en série' })}</Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'Give the series a unique name, then select at least two instruments to include in order.',
                fr: 'Donnez un nom unique à la série, puis sélectionnez au moins deux instruments à inclure dans l’ordre.'
              })}
            </Dialog.Description>
          </Dialog.Header>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="series-name">
                {t({ en: 'Name', fr: 'Nom' })}
              </label>
              <Input
                id="series-name"
                placeholder={t({ en: 'e.g. Baseline Battery', fr: 'p. ex. Batterie de base' })}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              {titleTaken && (
                <p className="text-destructive text-xs">
                  {t({
                    en: 'An instrument with this name already exists.',
                    fr: 'Un instrument portant ce nom existe déjà.'
                  })}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="series-instructions">
                {t({ en: 'Instructions', fr: 'Instructions' })}
              </label>
              <TextArea
                id="series-instructions"
                placeholder={t({
                  en: 'Optional instructions shown before the series begins.',
                  fr: 'Instructions facultatives affichées avant le début de la série.'
                })}
                rows={3}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {t({ en: 'Available instruments', fr: 'Instruments disponibles' })}
                {selectedIds.length > 0 && ` (${selectedIds.length})`}
              </span>
              <SearchBar
                placeholder={t({ en: 'Search instruments...', fr: 'Rechercher des instruments...' })}
                value={search}
                onValueChange={setSearch}
              />
              <div className="text-muted-foreground flex items-center justify-between px-2 text-xs font-medium uppercase">
                <span>{t({ en: 'Instrument', fr: 'Instrument' })}</span>
                <span>{t({ en: 'Series order', fr: 'Ordre de la série' })}</span>
              </div>
              <div className="max-h-[40vh] space-y-1 overflow-auto">
                {filteredForms.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    {t({ en: 'No instruments available.', fr: 'Aucun instrument disponible.' })}
                  </p>
                ) : (
                  filteredForms.map((form) => {
                    const order = selectedIds.indexOf(form.id);
                    return (
                      <label
                        className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                        key={form.id}
                      >
                        <Checkbox checked={order !== -1} onCheckedChange={() => toggle(form.id)} />
                        <span className="truncate text-sm" title={form.title}>
                          {form.title}
                        </span>
                        {order !== -1 && <Badge variant="secondary">{order + 1}</Badge>}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={onClose}>
              {t({ en: 'Cancel', fr: 'Annuler' })}
            </Button>
            <Button disabled={!canCreate} type="button" onClick={() => void handleCreate()}>
              {t({ en: 'Create', fr: 'Créer' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
      {duplicateOf !== null && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setDuplicateOf(null);
          }}
        >
          <Dialog.Content className="sm:max-w-[450px]">
            <Dialog.Header>
              <Dialog.Title>{t({ en: 'Series Already Exists', fr: 'La série existe déjà' })}</Dialog.Title>
              <Dialog.Description>
                {t({
                  en: `A series named "${duplicateOf}" already contains the same forms — you can use it instead. Do you still want to create "${title.trim()}"?`,
                  fr: `Une série nommée « ${duplicateOf} » contient déjà les mêmes formulaires — vous pouvez l’utiliser à la place. Voulez-vous quand même créer « ${title.trim()} » ?`
                })}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button type="button" variant="outline" onClick={() => setDuplicateOf(null)}>
                {t({ en: 'No', fr: 'Non' })}
              </Button>
              <Button disabled={createMutation.isPending} type="button" onClick={() => void handleConfirmDuplicate()}>
                {t({ en: 'Yes, create anyway', fr: 'Oui, créer quand même' })}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </React.Fragment>
  );
};

const DeleteInstrumentDialog = ({
  item,
  onClose,
  onDeleted
}: {
  item: InstrumentItem;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteSeriesInstrumentMutation();

  // Close on either outcome: a series that is already in use is refused by the API, and leaving the
  // confirmation open after the user has been notified only invites them to press the button again.
  const handleDelete = () =>
    deleteMutation.mutate({ id: item.id }, { onSettled: onClose, onSuccess: () => onDeleted(item.id) });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className="sm:max-w-[450px]">
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Delete Series Instrument', fr: 'Supprimer l’instrument en série' })}</Dialog.Title>
          <Dialog.Description>
            {t({
              en: `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
              fr: `Êtes-vous sûr de vouloir supprimer « ${item.title} » ? Cette action est irréversible.`
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={onClose}>
            {t({ en: 'No', fr: 'Non' })}
          </Button>
          <Button disabled={deleteMutation.isPending} type="button" variant="danger" onClick={handleDelete}>
            {t({ en: 'Yes, delete', fr: 'Oui, supprimer' })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

const ManageGroupForm = ({ data, onSubmit, readOnly }: ManageGroupFormProps) => {
  const { existingTitles, groupId, hiddenAccessibleIds, initialSelectedIds, instruments, settingsInitialValues } = data;
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelectedIds));
  const [previewItem, setPreviewItem] = useState<InstrumentItem | null>(null);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InstrumentItem | null>(null);
  // Ids deleted during this session. The server has already detached them from the group, but our copy of
  // the group's accessible ids (seeded from the auth store) may still list them; we drop them at save time
  // so a just-deleted instrument is never re-sent as a dangling relation.
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());

  // Reseed the selection only when the user switches groups. `initialSelectedIds` gets a new identity
  // on every instrument-info refetch — including the one triggered by creating a series — and resyncing
  // on that would discard unsaved edits, among them the newly created series we just selected.
  const [syncedGroupId, setSyncedGroupId] = useState(groupId);
  if (syncedGroupId !== groupId) {
    setSyncedGroupId(groupId);
    setSelectedIds(new Set(initialSelectedIds));
  }

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  let description = t('group.manage.accessibleInstrumentsDesc');
  if (readOnly) {
    description += ` ${t('group.manage.accessibleInstrumentDemoNote')}`;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {previewItem && (
        <InstrumentPreviewDialog
          item={previewItem}
          items={[...instruments.form, ...instruments.interactive, ...instruments.series]}
          onClose={() => setPreviewItem(null)}
        />
      )}
      {showCreateSeries && (
        <CreateSeriesInstrumentDialog
          existingTitles={existingTitles}
          forms={[...instruments.form, ...instruments.interactive]}
          groupId={groupId}
          onClose={() => setShowCreateSeries(false)}
          onCreated={(id) => setSelectedIds((previous) => new Set(previous).add(id))}
        />
      )}
      {deletingItem && (
        <DeleteInstrumentDialog
          item={deletingItem}
          onClose={() => setDeletingItem(null)}
          onDeleted={(id) => setDeletedIds((prev) => new Set(prev).add(id))}
        />
      )}
      <Heading variant="h4">{t('group.manage.accessibleInstruments')}</Heading>
      <p className="text-muted-foreground mb-3 mt-1 text-sm">{description}</p>
      <div className="mb-4">
        <SearchBar
          placeholder={t({ en: 'Search instruments...', fr: 'Rechercher des instruments...' })}
          value={search}
          onValueChange={setSearch}
        />
      </div>
      <InstrumentSection
        items={instruments.form}
        readOnly={readOnly}
        search={search}
        selectedIds={selectedIds}
        title={t('group.manage.forms')}
        onPreview={setPreviewItem}
        onToggle={toggle}
      />
      <InstrumentSection
        items={instruments.interactive}
        readOnly={readOnly}
        search={search}
        selectedIds={selectedIds}
        title={t('group.manage.interactive')}
        onPreview={setPreviewItem}
        onToggle={toggle}
      />
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('group.manage.series')}</h3>
        {!readOnly && (
          <Button size="sm" type="button" variant="primary" onClick={() => setShowCreateSeries(true)}>
            {t({ en: 'Create series', fr: 'Créer une série' })}
          </Button>
        )}
      </div>
      <InstrumentSection
        items={instruments.series}
        readOnly={readOnly}
        search={search}
        selectedIds={selectedIds}
        title=""
        onDelete={setDeletingItem}
        onPreview={setPreviewItem}
        onToggle={toggle}
      />
      <Form
        content={[
          {
            fields: {
              subjectIdDisplayLength: {
                kind: 'number',
                label: t({
                  en: 'Preferred Subject ID Display Length',
                  fr: "La longueur d'affichage préférée de l'ID"
                }),
                variant: 'input'
              }
            },
            title: t({
              en: 'Display Settings',
              fr: "Paramètres d'affichage"
            })
          },
          {
            fields: {
              minimumAgeApplied: {
                kind: 'boolean',
                label: t({
                  en: 'Apply Minimum Age For Subjects',
                  fr: 'Appliquer un âge minimum aux sujets'
                }),
                variant: 'radio'
              },
              // eslint-disable-next-line perfectionist/sort-objects
              minimumAge: {
                deps: ['minimumAgeApplied'],
                kind: 'dynamic',
                render: (data) => {
                  if (data.minimumAgeApplied) {
                    return {
                      kind: 'number',
                      label: t({
                        en: 'Minimum Age',
                        fr: 'Âge minimum'
                      }),
                      variant: 'input'
                    };
                  }
                  return null;
                }
              }
            },
            title: t({
              en: 'Age Limit Settings',
              fr: "Paramètres de limite d'âge"
            })
          },
          {
            fields: {
              defaultIdentificationMethod: {
                kind: 'string',
                label: t('group.manage.defaultSubjectIdMethod'),
                options: {
                  CUSTOM_ID: t('common.customIdentifier'),
                  PERSONAL_INFO: t('common.personalInfo')
                },
                variant: 'select'
              },
              idValidationRegex: {
                description: t({
                  en: 'Define a custom regular expression to validate subject IDs (see https://regexr.com for help designing your regular expression).',
                  fr: "Définir une expression régulière pour valider les identifiants des sujets (voir https://regexr.com pour obtenir de l'aide dans la conception de votre expression régulière)."
                }),
                kind: 'string',
                label: t({
                  en: 'ID Validation Pattern',
                  fr: "Modèle de validation d'identifiant"
                }),
                variant: 'input'
              },
              idValidationRegexErrorMessageEn: {
                deps: ['idValidationRegex'],
                kind: 'dynamic',
                render: (data) => {
                  if (!data.idValidationRegex) {
                    return null;
                  }
                  return {
                    kind: 'string',
                    label: t({
                      en: 'Custom ID Validation Message (English)',
                      fr: 'Message de validation spécifique (en anglais)'
                    }),
                    variant: 'input'
                  };
                }
              },
              idValidationRegexErrorMessageFr: {
                deps: ['idValidationRegex'],
                kind: 'dynamic',
                render: (data) => {
                  if (!data.idValidationRegex) {
                    return null;
                  }
                  return {
                    kind: 'string',
                    label: t({
                      en: 'Custom ID Validation Message (French)',
                      fr: 'Message de validation spécifique (en français)'
                    }),
                    variant: 'input'
                  };
                }
              }
            },
            title: t('group.manage.groupSettings')
          }
        ]}
        initialValues={settingsInitialValues}
        preventResetValuesOnReset={true}
        readOnly={readOnly}
        validationSchema={z
          .object({
            defaultIdentificationMethod: $SubjectIdentificationMethod.optional(),
            idValidationRegex: $RegexString.optional(),
            idValidationRegexErrorMessageEn: z.string().optional(),
            idValidationRegexErrorMessageFr: z.string().optional(),
            minimumAge: z.number().int().positive().optional(),
            minimumAgeApplied: z.boolean().optional(),
            subjectIdDisplayLength: z.number().int().min(1).optional()
          })
          .check((ctx) => {
            if (ctx.value.minimumAgeApplied && !ctx.value.minimumAge) {
              ctx.issues.push({
                code: 'custom',
                input: ctx.value.minimumAge,
                message: t({
                  en: 'Please enter an age',
                  fr: 'Veuillez entrer un âge'
                }),
                path: ['minimumAge']
              });
            }
            return;
          })}
        onSubmit={(formData) => {
          void onSubmit({
            accessibleInstrumentIds: [
              ...hiddenAccessibleIds,
              ...expandSelectedSeriesIds({
                selectedIds,
                series: instruments.series
              })
            ].filter((id) => !deletedIds.has(id)),
            settings: {
              defaultIdentificationMethod: formData.defaultIdentificationMethod,
              idValidationRegex: formData.idValidationRegex,
              idValidationRegexErrorMessage: {
                en: formData.idValidationRegexErrorMessageEn,
                fr: formData.idValidationRegexErrorMessageFr
              },
              minimumAge: formData.minimumAgeApplied ? formData.minimumAge : null,
              subjectIdDisplayLength: formData.subjectIdDisplayLength
            }
          });
        }}
      />
    </div>
  );
};

const RouteComponent = () => {
  const { resolvedLanguage, t } = useTranslation('group');
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const updateGroupMutation = useUpdateGroupMutation();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const changeGroup = useAppStore((store) => store.changeGroup);
  const setupState = useSetupStateQuery();

  const availableInstruments = instrumentInfoQuery.data;

  const accessibleInstrumentIds = currentGroup?.accessibleInstrumentIds;
  const instrumentRepoIds = currentGroup?.instrumentRepoIds;
  const defaultIdentificationMethod = currentGroup?.settings.defaultIdentificationMethod;

  const data = useMemo(() => {
    if (!availableInstruments) {
      return null;
    }

    const accessibleSet = new Set(accessibleInstrumentIds ?? []);
    const assignedRepos = new Set(instrumentRepoIds ?? []);

    const instruments: CategorizedInstruments = { form: [], interactive: [], series: [] };
    const visibleIds = new Set<string>();

    for (const instrument of availableInstruments) {
      const repoId = instrument.sourceRepo?.id ?? null;
      // Show an instrument if it was uploaded manually, comes from a repo currently assigned to this
      // group, or has already been selected by the group (so selections survive repo removal).
      const isVisible = repoId === null || assignedRepos.has(repoId) || accessibleSet.has(instrument.id);
      if (!isVisible) {
        continue;
      }
      visibleIds.add(instrument.id);
      // Provenance is determined by the repo id, not the name: a legacy repo instrument may have a null
      // name but is still repo-sourced (and so must not get the "manual" delete affordance). We fall back
      // to a placeholder label only for display.
      const source: InstrumentSource = repoId
        ? { kind: 'repo', name: instrument.sourceRepo?.name ?? t({ en: 'Unknown repository', fr: 'Dépôt inconnu' }) }
        : { kind: 'manual' };
      const item: InstrumentItem = {
        authors: instrument.details.authors,
        description: instrument.details.description,
        id: instrument.id,
        internal: instrument.kind === 'SERIES' ? null : instrument.internal,
        kind: instrument.kind,
        seriesItems: instrument.kind === 'SERIES' ? instrument.seriesItems : undefined,
        source,
        title: instrument.details.title
      };
      if (instrument.kind === 'FORM') {
        instruments.form.push(item);
      } else if (instrument.kind === 'INTERACTIVE') {
        instruments.interactive.push(item);
      } else if (instrument.kind === 'SERIES') {
        instruments.series.push(item);
      }
    }

    const initialSelectedIds = [...accessibleSet].filter((id) => visibleIds.has(id));
    // Preserve any accessible ids we are not displaying (defensive: e.g. instruments that failed to load).
    const hiddenAccessibleIds = [...accessibleSet].filter((id) => !visibleIds.has(id));

    const settings = currentGroup?.settings;
    const settingsInitialValues: SettingsValues = {
      defaultIdentificationMethod,
      idValidationRegex: settings?.idValidationRegex,
      idValidationRegexErrorMessageEn: settings?.idValidationRegexErrorMessage?.en,
      idValidationRegexErrorMessageFr: settings?.idValidationRegexErrorMessage?.fr,
      minimumAge: settings?.minimumAge,
      minimumAgeApplied: typeof settings?.minimumAge === 'number',
      subjectIdDisplayLength: settings?.subjectIdDisplayLength
    };

    const existingTitles = [...instruments.form, ...instruments.interactive, ...instruments.series].map(
      (item) => item.title
    );

    return currentGroup
      ? {
          existingTitles,
          groupId: currentGroup.id,
          hiddenAccessibleIds,
          initialSelectedIds,
          instruments,
          settingsInitialValues
        }
      : null;
  }, [
    accessibleInstrumentIds,
    availableInstruments,
    currentGroup?.id,
    defaultIdentificationMethod,
    instrumentRepoIds,
    resolvedLanguage,
    t,
    currentGroup?.settings
  ]);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('manage.pageTitle')}
        </Heading>
      </PageHeader>
      <WithFallback
        Component={ManageGroupForm}
        key={currentGroup?.id}
        props={{
          data,
          onSubmit: async (data) => {
            const updatedGroup = await updateGroupMutation.mutateAsync(data);
            changeGroup(updatedGroup);
          },
          readOnly: Boolean(setupState.data?.isDemo && import.meta.env.PROD)
        }}
      />
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/group/manage')({
  component: RouteComponent
});
