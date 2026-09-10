import React from 'react';

import { Button, Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { ChevronRightIcon } from 'lucide-react';

import type { WizardStep } from './types';

const WIZARD_STEPS = ['SUBJECTS', 'INSTRUMENTS', 'REVIEW'] as const;

const STEP_LABELS = {
  INSTRUMENTS: { en: 'Instruments', fr: 'Instruments' },
  REVIEW: { en: 'Review', fr: 'Révision' },
  SUBJECTS: { en: 'Subjects', fr: 'Sujets' }
} as const;

/** The screen a breadcrumb returns to. Subjects re-enters at the source step, not the mapping one. */
const STEP_ENTRY = {
  INSTRUMENTS: 'TIMEPOINTS',
  REVIEW: 'REVIEW',
  SUBJECTS: 'SOURCE'
} as const satisfies { [K in WizardStepName]: WizardStep };

type WizardStepName = (typeof WIZARD_STEPS)[number];

type StepLayoutProps = {
  /** Rendered right-aligned in the header, for a per-step summary. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  description: string;
  /** Actions for this step. Laid out identically on every step so the primary action never moves. */
  footer?: React.ReactNode;
  onStepChange?: (step: WizardStep) => void;
  step: null | WizardStepName;
  title: string;
};

/**
 * One frame for every step, so the wizard reads as a single flow rather than a series of unrelated
 * screens: the same card, the same heading level, the same spacing, and a primary action that stays
 * in one place from step to step.
 */
const StepLayout = ({ aside, children, description, footer, onStepChange, step, title }: StepLayoutProps) => {
  const { t } = useTranslation();
  const currentIndex = step ? WIZARD_STEPS.indexOf(step) : -1;

  return (
    <Card>
      <Card.Header className="gap-3">
        {currentIndex !== -1 && (
          <nav aria-label={t({ en: 'Progress', fr: 'Progression' })} data-testid="bulk-breadcrumbs">
            <ol className="flex flex-wrap items-center gap-1">
              {WIZARD_STEPS.map((name, index) => {
                const isCurrent = index === currentIndex;
                // Only a step already completed can be revisited; jumping ahead would skip the work
                // the later step depends on.
                const isNavigable = index < currentIndex && Boolean(onStepChange);
                const label = `${index + 1}. ${t(STEP_LABELS[name])}`;
                return (
                  <li className="flex items-center gap-1" key={name}>
                    {index > 0 && (
                      <ChevronRightIcon aria-hidden="true" className="text-muted-foreground/50 h-3.5 w-3.5" />
                    )}
                    <Button
                      aria-current={isCurrent ? 'step' : undefined}
                      // Disabled because you are already here, but not dimmed like a step you
                      // cannot reach yet: it carries the accent so the position is obvious.
                      className={cn(isCurrent && 'border-primary text-primary font-semibold disabled:opacity-100')}
                      data-testid={`bulk-breadcrumb-${name}`}
                      disabled={!isNavigable}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => onStepChange?.(STEP_ENTRY[name])}
                    >
                      {label}
                    </Button>
                  </li>
                );
              })}
            </ol>
          </nav>
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
