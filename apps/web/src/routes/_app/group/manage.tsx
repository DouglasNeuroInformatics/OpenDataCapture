import React, { useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Form,
  Heading,
  Input,
  SearchBar,
  TextArea
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { ScalarInstrumentInternal } from '@opendatacapture/runtime-core';
import { $RegexString, toInstrumentAuthoringLanguage } from '@opendatacapture/schemas/core';
import type { $UpdateGroupData } from '@opendatacapture/schemas/group';
import type { $CreateSeriesInstrumentData } from '@opendatacapture/schemas/instrument';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import { EyeIcon, TrashIcon } from 'lucide-react';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { InstrumentPreviewDialog } from '@/components/InstrumentPreviewDialog';
import type { InstrumentPreviewItem, InstrumentSource } from '@/components/InstrumentPreviewDialog';
import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useCreateSeriesInstrumentMutation } from '@/hooks/useCreateSeriesInstrumentMutation';
import { useDeleteSeriesInstrumentMutation } from '@/hooks/useDeleteSeriesInstrumentMutation';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateGroupMutation } from '@/hooks/useUpdateGroupMutation';
import { useAppStore } from '@/store';
import { buildSeriesAvailability } from '@/utils/series-availability';

/**
 * The row's trailing columns, as one set of measurements: an ISO date is a fixed width, the trash is
 * hung in padding of its own width plus the column gap, and the create-series button spans the date
 * and the eye. Written once because the four places that use them only line up while they agree.
 */
const DATE_COLUMN_WIDTH = '5.5rem';
const COLUMN_GAP = '0.75rem';
const ACTION_WIDTH = '1.5rem';
const ACTION_GUTTER = `calc(${ACTION_WIDTH} + ${COLUMN_GAP})`;

type InstrumentItem = InstrumentPreviewItem & {
  // Whether this group owns the instrument and may therefore delete it. Only a series created by this
  // group qualifies: scalar instruments are never deletable, and a series with no owning group is
  // shared across the whole instance.
  isDeletable: boolean;
};

type SeriesInstrumentItem = InstrumentItem & { seriesItems: { id: string }[] };

type CategorizedInstruments = {
  form: InstrumentItem[];
  interactive: InstrumentItem[];
  series: SeriesInstrumentItem[];
};

const expandSelectedSeriesIds = ({
  selectedIds,
  series
}: {
  selectedIds: Set<string>;
  series: SeriesInstrumentItem[];
}) => {
  const expandedIds = new Set(selectedIds);
  for (const item of series) {
    if (!selectedIds.has(item.id)) {
      continue;
    }
    for (const seriesItem of item.seriesItems) {
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
  onSubmit: (data: Partial<$UpdateGroupData>) => Promisable<any>;
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
          {t({
            en: 'No instruments available.',
            es: 'No hay instrumentos disponibles.',
            fr: 'Aucun instrument disponible.'
          })}
        </p>
      ) : (
        // The tracks live on the section, not the row: a row that is its own grid sizes its columns
        // from its own content and lines up with nothing.
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-y-1">
          {filtered.map((item) => (
            <div
              // The hover background is set explicitly, so pin the text against it rather than leaving it
              // to whatever `--foreground` the surface resolves to.
              // The trash is hung in the right padding, so the eye stops short of the section edge and
              // the trash lands on it.
              className="hover:text-foreground relative col-span-5 grid grid-cols-subgrid items-center gap-x-3 rounded-md py-1.5 pl-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              key={item.id}
              style={{ paddingRight: ACTION_GUTTER }}
            >
              <Checkbox
                checked={selectedIds.has(item.id)}
                data-testid={`instrument-checkbox-${item.title}`}
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
              {/* Repo names vary in length, so only their right edge can form a column. */}
              <div className="flex justify-end">
                <Badge variant={item.source.kind === 'repo' ? 'secondary' : 'outline'}>
                  {item.source.kind === 'repo'
                    ? item.source.name
                    : t({ en: 'No repo', es: 'Sin repositorio', fr: 'Aucun dépôt' })}
                </Badge>
              </div>
              {/* Fixed rather than content width, so a section whose rows have no date still reserves
                  the column and its repo tags stay on the same line as every other section's. */}
              <div className="flex justify-end" style={{ width: DATE_COLUMN_WIDTH }}>
                {item.createdAt && (
                  <Badge data-testid={`instrument-created-at-${item.title}`} variant="outline">
                    {toBasicISOString(item.createdAt)}
                  </Badge>
                )}
              </div>
              {/* Lucide's eye leaves its iris `circle` unfilled; `fill-current` fills it with whatever
                  colour the hover rule above has already set. */}
              <button
                aria-label={t({
                  en: 'Preview instrument',
                  es: 'Vista previa del instrumento',
                  fr: "Aperçu de l'instrument"
                })}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors hover:[&_circle]:fill-current"
                data-testid={`instrument-preview-${item.title}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(item);
                }}
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              {/* Not a sixth column: one would collapse on rows without a delete and take the eye's
                  position with it. */}
              {onDelete && !readOnly && item.isDeletable && (
                <button
                  aria-label={t({
                    en: 'Delete instrument',
                    es: 'Eliminar instrumento',
                    fr: "Supprimer l'instrument"
                  })}
                  className="text-muted-foreground hover:text-destructive absolute top-1/2 right-0 -translate-y-1/2 p-1 transition-colors"
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
          ))}
        </div>
      )}
    </div>
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
  const [description, setDescription] = useState('');
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
    // An instrument's details require a description, and the server falls back to the title when none
    // is given — so omitting the key leaves the series describing itself by name.
    details: { ...(description.trim() ? { description: description.trim() } : {}), title: title.trim() },
    groupId,
    items,
    language: toInstrumentAuthoringLanguage(resolvedLanguage)
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
        setDuplicateOf(
          typeof result.existingTitle === 'string'
            ? result.existingTitle
            : result.existingTitle[toInstrumentAuthoringLanguage(resolvedLanguage)]
        );
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
      <Dialog open onOpenChange={onClose}>
        <Dialog.Content className="sm:max-w-[600px]">
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Create Series Instrument',
                es: 'Crear serie de instrumentos',
                fr: 'Créer un instrument en série'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'Give the series a unique name, then select at least two instruments to include in order.',
                es: 'Asigne un nombre único a la serie y seleccione al menos dos instrumentos para incluirlos en orden.',
                fr: 'Donnez un nom unique à la série, puis sélectionnez au moins deux instruments à inclure dans l’ordre.'
              })}
            </Dialog.Description>
          </Dialog.Header>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="series-name">
                {t({ en: 'Name', es: 'Nombre', fr: 'Nom' })}
              </label>
              <Input
                id="series-name"
                placeholder={t({
                  en: 'e.g. Baseline Battery',
                  es: 'p. ej. Batería inicial',
                  fr: 'p. ex. Batterie de base'
                })}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              {titleTaken && (
                <p className="text-destructive text-xs">
                  {t({
                    en: 'An instrument with this name already exists.',
                    es: 'Ya existe un instrumento con este nombre.',
                    fr: 'Un instrument portant ce nom existe déjà.'
                  })}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="series-description">
                {t({ en: 'Description', es: 'Descripción', fr: 'Description' })}
              </label>
              <TextArea
                id="series-description"
                placeholder={t({
                  en: 'Optional summary of the series, shown wherever it is listed.',
                  es: 'Resumen opcional de la serie, mostrado en todos los lugares donde aparece.',
                  fr: 'Résumé facultatif de la série, affiché partout où elle est listée.'
                })}
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="series-instructions">
                {t({ en: 'Instructions', es: 'Instrucciones', fr: 'Instructions' })}
              </label>
              <TextArea
                id="series-instructions"
                placeholder={t({
                  en: 'Optional instructions shown before the series begins.',
                  es: 'Instrucciones opcionales que se muestran antes de que comience la serie.',
                  fr: 'Instructions facultatives affichées avant le début de la série.'
                })}
                rows={3}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {t({ en: 'Available instruments', es: 'Instrumentos disponibles', fr: 'Instruments disponibles' })}
                {selectedIds.length > 0 && ` (${selectedIds.length})`}
              </span>
              <SearchBar
                placeholder={t({
                  en: 'Search instruments...',
                  es: 'Buscar instrumentos...',
                  fr: 'Rechercher des instruments...'
                })}
                value={search}
                onValueChange={setSearch}
              />
              <div className="text-muted-foreground flex items-center justify-between px-2 text-xs font-medium uppercase">
                <span>{t({ en: 'Instrument', es: 'Instrumento', fr: 'Instrument' })}</span>
                <span>{t({ en: 'Series order', es: 'Orden de la serie', fr: 'Ordre de la série' })}</span>
              </div>
              <div className="max-h-[40vh] space-y-1 overflow-auto">
                {filteredForms.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    {t({
                      en: 'No instruments available.',
                      es: 'No hay instrumentos disponibles.',
                      fr: 'Aucun instrument disponible.'
                    })}
                  </p>
                ) : (
                  filteredForms.map((form) => {
                    const order = selectedIds.indexOf(form.id);
                    return (
                      <label
                        className="hover:text-foreground grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
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
              {t({ en: 'Cancel', es: 'Cancelar', fr: 'Annuler' })}
            </Button>
            <Button disabled={!canCreate} type="button" onClick={() => void handleCreate()}>
              {t({ en: 'Create', es: 'Crear', fr: 'Créer' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
      {duplicateOf !== null && (
        <Dialog open onOpenChange={() => setDuplicateOf(null)}>
          <Dialog.Content className="sm:max-w-[450px]">
            <Dialog.Header>
              <Dialog.Title>
                {t({ en: 'Series Already Exists', es: 'La serie ya existe', fr: 'La série existe déjà' })}
              </Dialog.Title>
              <Dialog.Description>
                {t({
                  en: `A series named "${duplicateOf}" already contains the same forms — you can use it instead. Do you still want to create "${title.trim()}"?`,
                  es: `Una serie llamada "${duplicateOf}" ya contiene los mismos formularios: puede usarla en su lugar. ¿Aun así desea crear "${title.trim()}"?`,
                  fr: `Une série nommée « ${duplicateOf} » contient déjà les mêmes formulaires — vous pouvez l’utiliser à la place. Voulez-vous quand même créer « ${title.trim()} » ?`
                })}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button type="button" variant="outline" onClick={() => setDuplicateOf(null)}>
                {t({ en: 'No', es: 'No', fr: 'Non' })}
              </Button>
              <Button disabled={createMutation.isPending} type="button" onClick={() => void handleConfirmDuplicate()}>
                {t({ en: 'Yes, create anyway', es: 'Sí, crearla de todos modos', fr: 'Oui, créer quand même' })}
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
    <Dialog open onOpenChange={onClose}>
      <Dialog.Content className="sm:max-w-[450px]">
        <Dialog.Header>
          <Dialog.Title>
            {t({
              en: 'Delete Series Instrument',
              es: 'Eliminar serie de instrumentos',
              fr: 'Supprimer l’instrument en série'
            })}
          </Dialog.Title>
          <Dialog.Description>
            {t({
              en: `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
              es: `¿Seguro que desea eliminar "${item.title}"? Esta acción no se puede deshacer.`,
              fr: `Êtes-vous sûr de vouloir supprimer « ${item.title} » ? Cette action est irréversible.`
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={onClose}>
            {t({ en: 'No', es: 'No', fr: 'Non' })}
          </Button>
          <Button disabled={deleteMutation.isPending} type="button" variant="danger" onClick={handleDelete}>
            {t({ en: 'Yes, delete', es: 'Sí, eliminar', fr: 'Oui, supprimer' })}
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

  // The preview dialog resolves a series' item titles against the full list; a fresh array each render
  // would invalidate the memo it does that lookup in.
  const allItems = useMemo(
    () => [...instruments.form, ...instruments.interactive, ...instruments.series],
    [instruments]
  );

  return (
    <div className="mx-auto max-w-4xl">
      {previewItem && (
        <InstrumentPreviewDialog item={previewItem} items={allItems} onClose={() => setPreviewItem(null)} />
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
      <p className="text-muted-foreground mt-1 mb-3 text-sm">{description}</p>
      <div className="mb-4">
        <SearchBar
          placeholder={t({
            en: 'Search instruments...',
            es: 'Buscar instrumentos...',
            fr: 'Rechercher des instruments...'
          })}
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
      {/* The same right padding the rows carry, so the button ends on the eye's line rather than the
          trash's. */}
      <div className="mb-2 flex items-center justify-between" style={{ paddingRight: ACTION_GUTTER }}>
        <h3 className="text-sm font-semibold">{t('group.manage.series')}</h3>
        {!readOnly && (
          // The date column, the gap after it and the eye: the button spans exactly the two columns it
          // sits above. Written from the same values those columns use, so the three stay in step.
          <Button
            size="sm"
            style={{ width: `calc(${DATE_COLUMN_WIDTH} + ${COLUMN_GAP} + ${ACTION_WIDTH})` }}
            type="button"
            variant="primary"
            onClick={() => setShowCreateSeries(true)}
          >
            {t({ en: 'Create series', es: 'Crear serie', fr: 'Créer une série' })}
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
                  es: 'Longitud preferida del identificador de sujeto que se muestra',
                  fr: "La longueur d'affichage préférée de l'ID"
                }),
                variant: 'input'
              }
            },
            title: t({
              en: 'Display Settings',
              es: 'Configuración de visualización',
              fr: "Paramètres d'affichage"
            })
          },
          {
            fields: {
              minimumAgeApplied: {
                kind: 'boolean',
                label: t({
                  en: 'Apply Minimum Age For Subjects',
                  es: 'Aplicar una edad mínima a los sujetos',
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
                        es: 'Edad mínima',
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
              es: 'Configuración del límite de edad',
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
                  es: 'Defina una expresión regular personalizada para validar los identificadores de sujeto (consulte https://regexr.com para obtener ayuda al diseñarla).',
                  fr: "Définir une expression régulière pour valider les identifiants des sujets (voir https://regexr.com pour obtenir de l'aide dans la conception de votre expression régulière)."
                }),
                kind: 'string',
                label: t({
                  en: 'ID Validation Pattern',
                  es: 'Patrón de validación del identificador',
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
                      es: 'Mensaje personalizado de validación del identificador (inglés)',
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
                      es: 'Mensaje personalizado de validación del identificador (francés)',
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
                  es: 'Introduzca una edad',
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
      // An archived series is left out of the list but not the group's selection: `hiddenAccessibleIds`
      // carries it through a save, so unarchiving restores it here without the group opting back in.
      if (instrument.kind === 'SERIES' && instrument.archivedAt) {
        continue;
      }
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
        ? {
            kind: 'repo',
            name:
              instrument.sourceRepo?.name ??
              t({ en: 'Unknown repository', es: 'Repositorio desconocido', fr: 'Dépôt inconnu' })
          }
        : { kind: 'manual' };
      const seriesGroupId = instrument.kind === 'SERIES' ? (instrument.seriesGroupId ?? null) : null;
      const item: InstrumentItem = {
        authors: instrument.details.authors,
        availability: buildSeriesAvailability({ currentGroup, instrumentKind: instrument.kind, seriesGroupId }),
        createdAt: instrument.createdAt ?? null,
        description: instrument.details.description,
        id: instrument.id,
        internal: instrument.kind === 'SERIES' ? null : instrument.internal,
        isDeletable: instrument.kind === 'SERIES' && seriesGroupId === currentGroup?.id,
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
        instruments.series.push({ ...item, seriesItems: instrument.seriesItems });
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
    currentGroup?.name,
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
      {/* The key remounts the form on a group switch, the only time its selection may be reseeded:
          `initialSelectedIds` changes identity on every refetch, and reseeding then would drop unsaved edits. */}
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
