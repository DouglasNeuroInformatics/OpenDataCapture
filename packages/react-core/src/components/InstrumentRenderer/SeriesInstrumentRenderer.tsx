import { useEffect, useState } from 'react';

import { replacer } from '@douglasneuroinformatics/libjs';
import { Button, Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Json } from '@opendatacapture/runtime-core';
import type { SeriesInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { CircleCheckIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { useInterpretedInstrument } from '../../hooks/useInterpretedInstrument';
import { FormContent } from '../FormContent';
import { InstrumentOverview } from '../InstrumentOverview';
import { InteractiveContent } from '../InteractiveContent';
import { ContentPlaceholder } from './ContentPlaceholder';
import { InstrumentRendererContainer } from './InstrumentRendererContainer';

import type { InstrumentSubmitHandler, SubjectDisplayInfo } from '../../types';

export type SeriesInstrumentRendererProps = {
  className?: string;
  initialSeriesIndex?: number;
  onSubmit: InstrumentSubmitHandler;
  subject?: SubjectDisplayInfo;
  target: SeriesInstrumentBundleContainer;
};

export const SeriesInstrumentRenderer = ({
  className,
  initialSeriesIndex,
  onSubmit,
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

  const scalarBundle = target.items[currentItemIndex]?.bundle;
  const scalarId = target.items[currentItemIndex]?.id;

  const rootState = useInterpretedInstrument(target.bundle);
  const scalarState = useInterpretedInstrument(scalarBundle ?? '');

  const [isInstrumentInProgress, setIsInstrumentInProgress] = useState(false);

  const handleSubmit = async (data: unknown) => {
    await onSubmit({
      data: JSON.parse(JSON.stringify(data, replacer)) as Json,
      index,
      instrumentId: scalarId!,
      kind: 'SERIES'
    });
    setCurrentItemIndex(currentItemIndex + 1);
    setIsInstrumentInProgress(false);
  };

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
            .with({ index: 0 }, () => <InstrumentOverview instrument={instrument} onNext={() => setIndex(1)} />)
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
                      <FormContent instrument={instrument} onSubmit={handleSubmit} />
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
                  {t({
                    en: 'You have successfully completed all steps of this instrument.',
                    fr: 'Vous avez terminé avec succès toutes les étapes de cet instrument.'
                  })}
                </p>
              </div>
            ))
            .otherwise(() => null)
        )
        .exhaustive()}
    </InstrumentRendererContainer>
  );
};
