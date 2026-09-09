import React from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';

/** Not copy: the divider between step names in the progress line. */
const SEPARATOR = '/';

const WIZARD_STEPS = ['SUBJECTS', 'INSTRUMENTS', 'REVIEW'] as const;

type WizardStepName = (typeof WIZARD_STEPS)[number];

type StepLayoutProps = {
  /** Rendered right-aligned in the header, for a per-step summary. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  description: string;
  /** Actions for this step. Laid out identically on every step so the primary action never moves. */
  footer?: React.ReactNode;
  step: null | WizardStepName;
  title: string;
};

/**
 * One frame for every step, so the wizard reads as a single flow rather than a series of unrelated
 * screens: the same card, the same heading level, the same spacing, and a primary action that stays
 * in one place from step to step.
 */
const StepLayout = ({ aside, children, description, footer, step, title }: StepLayoutProps) => {
  const { t } = useTranslation();
  const currentIndex = step ? WIZARD_STEPS.indexOf(step) : -1;

  return (
    <Card>
      <Card.Header className="gap-3">
        {currentIndex !== -1 && (
          <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide">
            {WIZARD_STEPS.map((name, index) => {
              const label = `${index + 1}. ${
                name === 'SUBJECTS'
                  ? t({ en: 'Subjects', fr: 'Sujets' })
                  : name === 'INSTRUMENTS'
                    ? t({ en: 'Instruments', fr: 'Instruments' })
                    : t({ en: 'Review', fr: 'Révision' })
              }`;
              return (
                <li className="flex items-center gap-2" key={name}>
                  {index > 0 && <span aria-hidden="true">{SEPARATOR}</span>}
                  <span
                    className={cn(
                      index === currentIndex && 'text-foreground',
                      index < currentIndex && 'text-muted-foreground/70'
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Card.Title>{title}</Card.Title>
            <Card.Description>{description}</Card.Description>
          </div>
          {aside}
        </div>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">{children}</Card.Content>
      {footer && <Card.Footer className="flex justify-end gap-2">{footer}</Card.Footer>}
    </Card>
  );
};

export type { WizardStepName };

export { StepLayout, WIZARD_STEPS };
