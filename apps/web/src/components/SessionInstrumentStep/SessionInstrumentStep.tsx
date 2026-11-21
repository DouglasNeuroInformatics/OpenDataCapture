import { Button, Spinner } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentRenderer } from '@opendatacapture/react-core';
import type { InstrumentSubmitHandler } from '@opendatacapture/react-core';
import { ArrowLeftIcon } from 'lucide-react';

import { NavigationBlocker } from '@/components/NavigationBlocker';
import { useInstrumentBundle } from '@/hooks/useInstrumentBundle';

type SessionInstrumentStepProps = {
  instrumentId: string;
  onBack: () => void;
  onSubmit: InstrumentSubmitHandler;
};

export const SessionInstrumentStep = ({ instrumentId, onBack, onSubmit }: SessionInstrumentStepProps) => {
  const { t } = useTranslation();
  const instrumentBundleQuery = useInstrumentBundle(instrumentId);

  return (
    <div className="flex grow flex-col gap-4" data-testid="session-instrument-step">
      <div className="mx-auto w-full max-w-3xl">
        <Button data-testid="session-instrument-back" type="button" variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="mr-1 size-4" />
          {t({ en: 'Back', es: 'Atrás', fr: 'Retour' })}
        </Button>
      </div>
      {instrumentBundleQuery.data ? (
        <InstrumentRenderer
          className="mx-auto max-w-3xl"
          NavigationBlocker={NavigationBlocker}
          target={instrumentBundleQuery.data}
          onSubmit={onSubmit}
        />
      ) : (
        <Spinner />
      )}
    </div>
  );
};
