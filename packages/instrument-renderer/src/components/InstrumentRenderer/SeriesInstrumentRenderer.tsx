import { useEffect, useState } from 'react';

import { replacer } from '@douglasneuroinformatics/libjs';
import { Button, Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import type { Json } from '@opendatacapture/runtime-core';
import type { SeriesInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { useTranslation } from 'react-i18next';
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
  onSubmit: InstrumentSubmitHandler;
  subject?: SubjectDisplayInfo;
  target: SeriesInstrumentBundleContainer;
};

export const SeriesInstrumentRenderer = ({ className, onSubmit, target }: SeriesInstrumentRendererProps) => {
  const [index, setIndex] = useState<0 | 1 | 2>(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const { t } = useTranslation();

  const scalarBundle = target.items[currentItemIndex]?.bundle;
  const scalarId = target.items[currentItemIndex]?.id;

  const rootState = useInterpretedInstrument(target.bundle);
  const scalarState = useInterpretedInstrument(scalarBundle ?? '');

  const [isInstrumentInProgress, setIsInstrumentInProgress] = useState(false);

  const handleSubmit = async (data: unknown) => {
    await onSubmit({
      data: JSON.parse(JSON.stringify(data, replacer)) as Json,
      instrumentId: scalarId!
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
          <ContentPlaceholder message={t('failedToLoadInstrumentDesc')} title={t('failedToLoadInstrument')} />
        ))
        .with({ status: 'DONE' }, ({ instrument }) =>
          match({ index, instrument, isInstrumentInProgress })
            .with({ index: 0 }, () => <InstrumentOverview instrument={instrument} onNext={() => setIndex(1)} />)
            .with({ index: 1, isInstrumentInProgress: false }, () => (
              <div className="flex flex-grow flex-col items-center justify-center space-y-1 py-32 text-center">
                <Heading className="font-medium" variant="h5">
                  {t('seriesInstrumentContent.inProgress')}
                </Heading>
                <p className="text-muted-foreground text-sm">
                  {t('seriesInstrumentContent.instrumentsCompleted', {
                    completed: currentItemIndex,
                    total: target.items.length
                  })}
                </p>
                <div className="pt-2">
                  <Button
                    disabled={isInstrumentInProgress}
                    type="button"
                    onClick={() => setIsInstrumentInProgress(true)}
                  >
                    {t('begin')}
                  </Button>
                </div>
              </div>
            ))
            .with({ index: 1, isInstrumentInProgress: true }, () =>
              match(scalarState)
                .with({ status: 'ERROR' }, () => (
                  <ContentPlaceholder message={t('failedToLoadInstrumentDesc')} title={t('failedToLoadInstrument')} />
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
            .with({ index: 2 }, () => <ContentPlaceholder title={t('instrumentComplete')} />)
            .otherwise(() => null)
        )
        .exhaustive()}
    </InstrumentRendererContainer>
  );
};
