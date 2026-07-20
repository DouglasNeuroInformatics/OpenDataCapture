import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { replacer } from '@douglasneuroinformatics/libjs';
import { Button, Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { getSeriesInstrumentParams } from '@opendatacapture/instrument-utils';
import type { AnyUnilingualScalarInstrument, Json, UnilingualSeriesInstrument } from '@opendatacapture/runtime-core';
import type { SeriesInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { CircleCheckIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { useInterpretedInstrument } from '../../hooks/useInterpretedInstrument';
import { FormContent } from '../FormContent';
import { InstrumentOverview } from '../InstrumentOverview';
import { InteractiveContent } from '../InteractiveContent';
import { ContentPlaceholder } from './ContentPlaceholder';
import { InstrumentRendererContainer } from './InstrumentRendererContainer';
import { validateSubmission } from './validateSubmission';

import type { LocalizedText, SubjectDisplayInfo } from '../../types';
import type { FormContentSubmitResult } from '../FormContent';
import type { InteractiveContentSubmitResult } from '../InteractiveContent';
import type { InstrumentSubmitHandler } from './types';

export type SeriesInstrumentRendererProps = {
  /** Content rendered directly above the "Begin" button on the overview screen. */
  beforeBegin?: ReactNode;
  className?: string;
  /** When true, the "Begin" button on the overview screen is disabled. */
  disableBegin?: boolean;
  initialSeriesIndex?: number;
  onSubmit: InstrumentSubmitHandler<'SERIES'>;
  subject?: SubjectDisplayInfo;
  /** A localizable label for each constituent form's submit button. */
  submitButtonLabel?: LocalizedText;
  target: SeriesInstrumentBundleContainer;
};

export const SeriesInstrumentRenderer = ({
  beforeBegin,
  className,
  disableBegin,
  initialSeriesIndex,
  onSubmit,
  submitButtonLabel,
  target
}: SeriesInstrumentRendererProps) => {
  const [index, setIndex] = useState<0 | 1 | 2>(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(() => {
    if (!initialSeriesIndex) {
      return 0;
    } else if (initialSeriesIndex >= target.items.length) {
      throw new Error(
        `Initial series index '${initialSeriesIndex}' must be less than length of items '${target.items.length}'`
      );
    }
    return initialSeriesIndex;
  });
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const scalarBundle = target.items[currentItemIndex]?.bundle;
  const scalarId = target.items[currentItemIndex]?.id;

  const rootState = useInterpretedInstrument<UnilingualSeriesInstrument>(target.bundle);
  const scalarState = useInterpretedInstrument<AnyUnilingualScalarInstrument>(scalarBundle ?? '');

  const [isInstrumentInProgress, setIsInstrumentInProgress] = useState(false);
  const [completion, setCompletion] = useState<null | { itemName?: string; terminated: boolean }>(null);

  const params = rootState.status === 'DONE' ? getSeriesInstrumentParams(rootState.instrument.content) : {};
  const skipProgress = params.skipProgress ?? false;

  const handleSubmit = async ({ data }: FormContentSubmitResult | InteractiveContentSubmitResult) => {
    const parsedData = JSON.parse(JSON.stringify(data, replacer)) as Json;
    if (scalarState.status === 'DONE') {
      const validationResult = validateSubmission(scalarState.instrument, parsedData);
      if (!validationResult.success) {
        console.error(validationResult.issues);
        addNotification({
          message: t({
            en: 'The information submitted is invalid and cannot be saved. Please contact the platform administrator.',
            fr: "Les informations soumises sont invalides et ne peuvent pas être enregistrées. Veuillez contacter l'administrateur de la plateforme."
          }),
          type: 'error'
        });
        return;
      }
    }
    const isLastItem = currentItemIndex === target.items.length - 1;
    // `scalarState` is DONE here (its content is what was just submitted); its
    // `internal.name` gives the item name for the predicate context.
    const itemName = scalarState.status === 'DONE' ? (scalarState.instrument.internal?.name ?? '') : '';
    const shouldTerminate = params.terminate?.(parsedData, { itemIndex: currentItemIndex, itemName }) ?? false;

    await onSubmit?.({
      complete: isLastItem || shouldTerminate,
      data: parsedData,
      index,
      instrumentId: scalarId!,
      kind: 'SERIES',
      seriesInstrumentId: target.id
    });

    if (isLastItem || shouldTerminate) {
      setCompletion({ itemName, terminated: shouldTerminate });
    }
    if (shouldTerminate) {
      setIndex(2);
      return;
    }
    setCurrentItemIndex(currentItemIndex + 1);
    if (!skipProgress) {
      setIsInstrumentInProgress(false);
    }
  };

  const completionMessage =
    params.completionMessage?.({ itemName: completion?.itemName, terminated: completion?.terminated ?? false }) ?? null;

  useEffect(() => {
    if (currentItemIndex === target.items.length) {
      setIndex(2);
    }
  }, [currentItemIndex, target.items.length]);

  return (
    <InstrumentRendererContainer className={className} index={index}>
      {match(rootState)
        .with({ status: 'LOADING' }, () => <Spinner />)
        .with({ status: 'ERROR' }, () => (
          <ContentPlaceholder
            message={t({
              en: 'An unexpected error occurred while loading this instrument. Please contact the platform administrator for further assistance.',
              fr: "Une erreur inattendue s'est produite lors du chargement de cet instrument. Veuillez contacter l'administrateur de la plateforme pour obtenir de l'aide."
            })}
            title={t({
              en: 'Failed to Load Instrument',
              fr: "Échec du chargement de l'instrument"
            })}
          />
        ))
        .with({ status: 'DONE' }, ({ instrument }) =>
          match({ index, instrument, isInstrumentInProgress })
            .with({ index: 0 }, () => (
              <InstrumentOverview
                beforeBegin={beforeBegin}
                disableBegin={disableBegin}
                instrument={instrument}
                onNext={() => {
                  setIndex(1);
                  if (skipProgress) {
                    setIsInstrumentInProgress(true);
                  }
                }}
              />
            ))
            .with({ index: 1, isInstrumentInProgress: false }, () => (
              <div className="flex grow flex-col items-center justify-center space-y-1 py-32 text-center">
                <Heading variant="h4">
                  {t({
                    en: 'Series Instrument in Progress',
                    fr: "Série d'instruments en cours"
                  })}
                </Heading>
                <p className="text-muted-foreground text-sm">
                  {t({
                    en: `Instruments Completed: ${currentItemIndex}/${target.items.length}`,
                    fr: `Nombre d'instruments complétés : ${currentItemIndex}/${target.items.length}`
                  })}
                </p>
                <div className="pt-2">
                  <Button
                    disabled={isInstrumentInProgress}
                    type="button"
                    onClick={() => setIsInstrumentInProgress(true)}
                  >
                    {t({ en: 'Begin', fr: 'Commencer' })}
                  </Button>
                </div>
              </div>
            ))
            .with({ index: 1, isInstrumentInProgress: true }, () =>
              match(scalarState)
                .with({ status: 'ERROR' }, () => (
                  <ContentPlaceholder
                    message={t({
                      en: 'An unexpected error occurred while loading this instrument. Please contact the platform administrator for further assistance.',
                      fr: "Une erreur inattendue s'est produite lors du chargement de cet instrument. Veuillez contacter l'administrateur de la plateforme pour obtenir de l'aide."
                    })}
                    title={t({
                      en: 'Failed to Load Instrument',
                      fr: "Échec du chargement de l'instrument"
                    })}
                  />
                ))
                .with({ status: 'LOADING' }, () => <Spinner />)
                .with({ status: 'DONE' }, () =>
                  match(scalarState)
                    .with({ instrument: { kind: 'FORM' } }, ({ instrument }) => (
                      <FormContent
                        instrument={instrument}
                        submitButtonLabel={submitButtonLabel}
                        onSubmit={handleSubmit}
                      />
                    ))
                    .with({ instrument: { kind: 'INTERACTIVE' } }, () => (
                      <InteractiveContent bundle={scalarBundle!} onSubmit={handleSubmit} />
                    ))
                    .otherwise(() => null)
                )
                .otherwise(() => null)
            )
            .with({ index: 2 }, () => (
              <div className="mx-auto flex max-w-prose grow flex-col items-center justify-center space-y-1 py-32 text-center">
                <CircleCheckIcon
                  className="fill-green-600 stroke-white [&>circle]:stroke-transparent"
                  style={{ height: '36px', width: '36px' }}
                />
                <Heading variant="h3">
                  {t({
                    en: 'Thank You!',
                    fr: 'Merci'
                  })}
                </Heading>
                <p className="text-muted-foreground text-sm">
                  {t(
                    completionMessage ?? {
                      en: 'You have successfully completed all steps of this instrument.',
                      fr: 'Vous avez terminé avec succès toutes les étapes de cet instrument.'
                    }
                  )}
                </p>
              </div>
            ))
            .otherwise(() => null)
        )
        .exhaustive()}
    </InstrumentRendererContainer>
  );
};
