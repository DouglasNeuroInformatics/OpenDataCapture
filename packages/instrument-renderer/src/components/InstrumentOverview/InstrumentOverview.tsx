import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';

export type InstrumentOverviewProps = {
  instrument: AnyUnilingualInstrument;
  onNext: () => void;
};

export const InstrumentOverview = ({ instrument, onNext }: InstrumentOverviewProps) => {
  const { t } = useTranslation();

  const estimatedDuration = instrument.clientDetails?.estimatedDuration ?? instrument.details.estimatedDuration;
  const instructions = instrument.clientDetails?.instructions ?? instrument.details.instructions;

  return (
    <div className="space-y-6">
      <Heading variant="h4">{instrument.clientDetails?.title ?? instrument.details.title}</Heading>
      <div className="mb-8 space-y-6">
        <div>
          {estimatedDuration && (
            <>
              <Heading variant="h5">
                {t({
                  en: 'Estimated Duration',
                  fr: 'Durée estimée'
                })}
              </Heading>
              <p className="text-muted-foreground text-sm">{`${estimatedDuration} minute(s)`}</p>
            </>
          )}
        </div>
        {Boolean(instructions?.length) && (
          <div>
            <Heading variant="h5">
              {t({
                en: 'Instructions',
                fr: 'Instructions'
              })}
            </Heading>
            <p className="text-muted-foreground text-sm">{instructions!.join(', ')}</p>
          </div>
        )}
      </div>
      <Button
        className="w-full"
        label={t({
          en: 'Begin',
          fr: 'Commencer'
        })}
        onClick={() => {
          onNext();
        }}
      />
    </div>
  );
};
