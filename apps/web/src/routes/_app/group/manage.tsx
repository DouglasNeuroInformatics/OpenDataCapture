import React, { useMemo, useState } from 'react';

import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Form,
  Heading,
  SearchBar,
  Spinner
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/react-core';
import { $RegexString } from '@opendatacapture/schemas/core';
import type { UpdateGroupData } from '@opendatacapture/schemas/group';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import { EyeIcon } from 'lucide-react';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
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
  kind: string;
  source: InstrumentSource;
  title: string;
};

type CategorizedInstruments = {
  form: InstrumentItem[];
  interactive: InstrumentItem[];
  series: InstrumentItem[];
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
  onPreview,
  onToggle,
  readOnly,
  search,
  selectedIds,
  title
}: {
  items: InstrumentItem[];
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
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">
          {t({ en: 'No instruments available.', fr: 'Aucun instrument disponible.' })}
        </p>
      ) : (
        <div className="space-y-1">
          {filtered.map((item) => (
            <div
              className="grid cursor-pointer grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
              key={item.id}
            >
              <Checkbox
                checked={selectedIds.has(item.id)}
                disabled={readOnly}
                onCheckedChange={() => onToggle(item.id)}
              />
              <span className="truncate text-sm" title={item.title}>
                {item.title}
              </span>
              <Badge className="shrink-0" variant={item.source.kind === 'repo' ? 'secondary' : 'outline'}>
                {item.source.kind === 'repo'
                  ? item.source.name
                  : t({ en: 'Uploaded manually', fr: 'Téléversé manuellement' })}
              </Badge>
              <button
                className="text-muted-foreground hover:text-foreground shrink-0 p-1 transition-colors"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(item);
                }}
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const InstrumentPreviewDialog = ({ item, onClose }: { item: InstrumentItem; onClose: () => void }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const bundleQuery = useInstrumentBundle(showForm ? item.id : null);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className={showForm ? 'sm:max-w-[800px]' : 'sm:max-w-[500px]'}>
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
              // Preview only: visually disable the submit button (pointer-events-none + dimmed) so no
              // record can be created, and make submit a no-op as a defensive backstop.
              <div className="[&_button[type='submit']]:pointer-events-none [&_button[type='submit']]:opacity-50">
                <InstrumentRenderer
                  target={bundleQuery.data}
                  onSubmit={() => {
                    // Intentionally does nothing: forms cannot be submitted in preview mode.
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <span className="font-medium">{t({ en: 'Kind', fr: 'Type' })}: </span>
              <span className="text-muted-foreground">{item.kind}</span>
            </div>
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
                {item.source.kind === 'repo'
                  ? item.source.name
                  : t({ en: 'Uploaded manually', fr: 'Téléversé manuellement' })}
              </span>
            </div>
            <div className="mt-2 flex justify-center">
              <Button onClick={() => setShowForm(true)}>{t({ en: 'Preview Form', fr: 'Aperçu du formulaire' })}</Button>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

const ManageGroupForm = ({ data, onSubmit, readOnly }: ManageGroupFormProps) => {
  const { hiddenAccessibleIds, initialSelectedIds, instruments, settingsInitialValues } = data;
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelectedIds));
  const [previewItem, setPreviewItem] = useState<InstrumentItem | null>(null);

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
      {previewItem && <InstrumentPreviewDialog item={previewItem} onClose={() => setPreviewItem(null)} />}
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
      <InstrumentSection
        items={instruments.series}
        readOnly={readOnly}
        search={search}
        selectedIds={selectedIds}
        title={t('group.manage.series')}
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
            accessibleInstrumentIds: [...hiddenAccessibleIds, ...selectedIds],
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
      // Show the repo name when we have one; legacy repo instruments without a stored name render as
      // "uploaded manually" (but are still filtered above as repo-sourced via their id).
      const repoName = instrument.sourceRepo?.name ?? null;
      const source: InstrumentSource = repoName ? { kind: 'repo', name: repoName } : { kind: 'manual' };
      const item: InstrumentItem = {
        authors: instrument.details.authors,
        description: instrument.details.description,
        id: instrument.id,
        kind: instrument.kind,
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

    return { hiddenAccessibleIds, initialSelectedIds, instruments, settingsInitialValues };
  }, [
    accessibleInstrumentIds,
    availableInstruments,
    defaultIdentificationMethod,
    instrumentRepoIds,
    resolvedLanguage,
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
