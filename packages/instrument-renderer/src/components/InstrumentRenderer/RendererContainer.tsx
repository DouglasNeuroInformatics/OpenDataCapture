import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useWindowSize } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { FileCheckIcon, MonitorIcon, PrinterIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type InstrumentRendererProps = {
  children: React.ReactNode;
  className?: string;
  index: 0 | 1 | 2;
};

export const RendererContainer = ({ children, className, index }: InstrumentRendererProps) => {
  const { height, width } = useWindowSize();
  const { i18n, t } = useTranslation();
  const icons = useRef<HTMLDivElement[]>([]);
  const [divideStyles, setDivideStyles] = useState<React.CSSProperties[]>([]);

  const steps = useMemo(
    () => [
      {
        icon: <FileCheckIcon />,
        label: t('steps.overview')
      },
      {
        icon: <MonitorIcon />,
        label: t('steps.questions')
      },
      {
        icon: <PrinterIcon />,
        label: t('steps.summary')
      }
    ],
    [i18n.resolvedLanguage]
  );

  useEffect(() => {
    const styles: React.CSSProperties[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const current = icons.current[i]!;
      const next = icons.current[i + 1]!;
      const left = current.offsetLeft + current.offsetWidth;
      styles.push({
        left,
        width: next.offsetLeft - left
      });
    }
    setDivideStyles(styles);
  }, [height, width]);

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      <div className="relative mb-10 flex items-center justify-between">
        {steps.map((step, i) => {
          return (
            <React.Fragment key={i}>
              <div className="flex items-center">
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={cn(
                      'h-12 w-12 rounded-full bg-sky-700 py-3 text-white transition duration-500 ease-in-out [&>*]:h-full [&>*]:w-full',
                      i > index && 'bg-slate-200 dark:bg-slate-700'
                    )}
                    ref={(e) => {
                      icons.current[i] = e!;
                    }}
                  >
                    {step.icon}
                  </div>
                  <span className="text-muted-foreground mt-2 text-xs font-medium uppercase">{step.label}</span>
                </div>
              </div>
              {i !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-6 flex-auto border-t-2 transition duration-500 ease-in-out',
                    i >= index ? 'border-slate-200 dark:border-slate-700' : 'border-sky-700'
                  )}
                  style={divideStyles[i]}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {children}
    </div>
  );
};
