import { useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Dialog, Spinner } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/react-core';
import type { ScalarInstrumentInternal } from '@opendatacapture/runtime-core';

import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';
import type { SeriesAvailability } from '@/utils/series-availability';

type InstrumentSource = { kind: 'manual' } | { kind: 'repo'; name: string };

type InstrumentPreviewItem = {
  authors?: null | string[];
  // Null for a scalar instrument: only a series is ever owned by a single group.
  availability: null | SeriesAvailability;
  // When the instrument was stored: uploaded, imported from a repository, or built as a series.
  createdAt: Date | null;
  description?: string;
  id: string;
  // The scalar instrument identity (name + edition); null for series instruments, which have no edition.
  internal: null | ScalarInstrumentInternal;
  kind: string;
  seriesItems?: { id: string }[];
  source: InstrumentSource;
  title: string;
};

/** Passed to the renderer as a localizable value; the shared component resolves it to the active language. */
const PREVIEW_SUBMIT_LABEL = { en: 'Preview Submit', es: 'Vista previa del envío', fr: 'Soumettre l’aperçu' };

const getSeriesPreviewItemTitles = ({
  fallbackTitle,
  items,
  seriesItems
}: {
  fallbackTitle: (index: number) => string;
  items: { id: string; title: string }[];
  seriesItems: { id: string }[];
}) => {
  return seriesItems.map((seriesItem, index) => {
    return items.find((item) => item.id === seriesItem.id)?.title ?? fallbackTitle(index);
  });
};

type InstrumentPreviewDialogProps = {
  item: InstrumentPreviewItem;
  // Every instrument the series' items may refer to, so they can be listed by title.
  items: { id: string; title: string }[];
  onClose: () => void;
};

/** An instrument's details, and a rendering of its form that submits nothing. */
export const InstrumentPreviewDialog = ({ item, items, onClose }: InstrumentPreviewDialogProps) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  // Only the rendered preview needs the bundle. Series composition comes from `item.seriesItems`, which
  // the info query already provides — fetching the bundle for it would pull down the compiled source of
  // every constituent instrument just to list their names.
  const bundleQuery = useInstrumentBundle(showForm ? item.id : null);
  const seriesItemTitles = useMemo(() => {
    return getSeriesPreviewItemTitles({
      fallbackTitle: (index) => t({ en: `Item ${index + 1}`, es: `Elemento ${index + 1}`, fr: `Élément ${index + 1}` }),
      items,
      seriesItems: item.seriesItems ?? []
    });
  }, [item.seriesItems, items, t]);

  return (
    <Dialog open onOpenChange={onClose}>
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
                  es: 'Error al cargar la vista previa del instrumento.',
                  fr: "Échec du chargement de l'aperçu de l'instrument."
                })}
              </p>
            )}
            {bundleQuery.data && (
              <InstrumentRenderer
                submitButtonLabel={PREVIEW_SUBMIT_LABEL}
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
                <span className="font-medium">{t({ en: 'Kind', es: 'Tipo', fr: 'Type' })}: </span>
                <span className="text-muted-foreground">{item.kind}</span>
              </div>
              {item.description && (
                <div>
                  <span className="font-medium">
                    {t({ en: 'Description', es: 'Descripción', fr: 'Description' })}:{' '}
                  </span>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
              )}
              {item.kind === 'SERIES' && (
                <div>
                  <span className="font-medium">
                    {t({ en: 'Series order', es: 'Orden de la serie', fr: 'Ordre de la série' })}
                    {seriesItemTitles.length > 0 && ` (${seriesItemTitles.length})`}:{' '}
                  </span>
                  {seriesItemTitles.length === 0 ? (
                    <span className="text-muted-foreground">
                      {t({
                        en: 'No items in this series.',
                        es: 'No hay elementos en esta serie.',
                        fr: 'Aucun élément dans cette série.'
                      })}
                    </span>
                  ) : (
                    <ol className="text-muted-foreground mt-1 max-h-48 list-decimal space-y-1 overflow-auto rounded-md border border-slate-200 py-2 pr-3 pl-8 dark:border-slate-800">
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
                  <span className="font-medium">{t({ en: 'Authors', es: 'Autores', fr: 'Auteurs' })}: </span>
                  <span className="text-muted-foreground">{item.authors.join(', ')}</span>
                </div>
              )}
              {item.internal && (
                <div>
                  <span className="font-medium">{t({ en: 'Edition', es: 'Edición', fr: 'Édition' })}: </span>
                  <span className="text-muted-foreground">{item.internal.edition}</span>
                </div>
              )}
              <div>
                <span className="font-medium">{t({ en: 'Source', es: 'Origen', fr: 'Source' })}: </span>
                <span className="text-muted-foreground">
                  {item.source.kind === 'repo'
                    ? item.source.name
                    : t({
                        en: 'No repo; it was manually added to the platform',
                        es: 'Sin repositorio; se agregó manualmente a la plataforma',
                        fr: 'Aucun dépôt ; ajouté manuellement à la plateforme'
                      })}
                </span>
              </div>
              {item.createdAt && (
                <div data-testid="instrument-created-at">
                  <span className="font-medium">{t({ en: 'Added', es: 'Agregado el', fr: 'Ajouté le' })}: </span>
                  <span className="text-muted-foreground">{toBasicISOString(item.createdAt)}</span>
                </div>
              )}
              {item.availability && (
                <div data-testid="instrument-availability">
                  <span className="font-medium">
                    {t({ en: 'Available to', es: 'Disponible para', fr: 'Disponible pour' })}:{' '}
                  </span>
                  <span className="text-muted-foreground">
                    {item.availability.kind === 'all'
                      ? t({ en: 'All groups', es: 'Todos los grupos', fr: 'Tous les groupes' })
                      : (item.availability.name ?? t({ en: 'Another group', es: 'Otro grupo', fr: 'Un autre groupe' }))}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3 flex shrink-0 justify-center border-t border-slate-200 pt-3 dark:border-slate-800">
              <Button onClick={() => setShowForm(true)}>
                {t({ en: 'Preview Form', es: 'Vista previa del formulario', fr: 'Aperçu du formulaire' })}
              </Button>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

export type { InstrumentPreviewItem, InstrumentSource };
