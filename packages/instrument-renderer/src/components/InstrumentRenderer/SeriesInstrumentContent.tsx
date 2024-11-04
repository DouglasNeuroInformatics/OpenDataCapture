import { useEffect, useRef, useState } from 'react';

import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createPortal } from 'react-dom';

import type { ScalarInstrumentRendererProps } from './ScalarInstrumentRenderer';

export type SeriesInstrumentContentProps = ScalarInstrumentRendererProps & {
  status: {
    completedInstruments: number;
    totalInstruments: number;
  };
};

export const SeriesInstrumentContent = ({ status }: SeriesInstrumentContentProps) => {
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement | null>(null);
  const popupWindow = useRef<null | Window>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      popupWindow.current = window.open('about:blank', '', 'width=200,height=200');
      const container = document.createElement('div');
      popupWindow.current!.document.body.appendChild(container);
      popupWindow.current?.document.write('Hello');
    }
    return () => popupWindow.current?.close();
  }, [isOpen]);

  return (
    <div className="flex flex-grow flex-col items-center justify-center space-y-1 py-32 text-center">
      <Heading className="font-medium" variant="h5">
        {t({
          en: 'Series Instrument in Process',
          fr: "Série d'instruments en cours"
        })}
      </Heading>
      <p className="text-muted-foreground text-sm">
        {t({
          en: `Instruments Completed: ${status.completedInstruments}/{${status.totalInstruments}}`,
          fr: `Nombre d'instruments complétés : ${status.completedInstruments}/{${status.totalInstruments}}`
        })}
      </p>
      <div className="pt-2">
        <Button disabled={isOpen} type="button" onClick={() => setIsOpen(true)}>
          {t({
            en: 'Begin',
            fr: 'Commencer'
          })}
        </Button>
      </div>
      {createPortal(<div ref={container} />, document.body)}
    </div>
  );
};
