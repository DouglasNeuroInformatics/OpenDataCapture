import React from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { CheckIcon } from 'lucide-react';

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
  /** Rendered right-aligned beside the title, for a per-step summary. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  description: string;
  /**
   * Actions for this step, right-aligned in the footer so the primary action never moves. A status
   * message belongs in here too, pushed to the left with `mr-auto`.
   */
  footer?: React.ReactNode;
  onStepChange?: (step: WizardStep) => void;
  step: null | WizardStepName;
  title: string;
};

/**
 * One frame for every step, so the wizard reads as a single flow rather than a series of unrelated
 * screens: the same card, the same heading level, the same spacing, and a primary action that stays
 * in one place from step to step. Structure comes from the two rules and the tables inside; nothing
 * in a step is boxed again.
 */
const StepLayout = ({ aside, children, description, footer, onStepChange, step, title }: StepLayoutProps) => {
  const { t } = useTranslation();
  const currentIndex = step ? WIZARD_STEPS.indexOf(step) : -1;

  return (
    <Card className="overflow-hidden">
      {currentIndex !== -1 && (
        <nav
          aria-label={t({ en: 'Progress', fr: 'Progression' })}
          className="border-b px-6 py-4"
          data-testid="bulk-breadcrumbs"
        >
          {/* Numbered markers joined by a rule, rather than a row of buttons: the buttons read as
              three competing actions. */}
          <ol className="mx-auto flex max-w-2xl items-center">
            {WIZARD_STEPS.map((name, index) => {
              const isCurrent = index === currentIndex;
              const isComplete = index < currentIndex;
              // Only a step already completed can be revisited; jumping ahead would skip the work
              // the later step depends on.
              const isNavigable = isComplete && Boolean(onStepChange);
              return (
                <li className={cn('flex items-center', index > 0 && 'flex-1')} key={name}>
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className={cn('mx-3 h-px flex-1', index <= currentIndex ? 'bg-primary/40' : 'bg-border')}
                    />
                  )}
                  <button
                    aria-current={isCurrent ? 'step' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-full text-sm transition-colors',
                      isNavigable ? 'hover:text-foreground cursor-pointer' : 'cursor-default'
                    )}
                    data-testid={`bulk-breadcrumb-${name}`}
                    disabled={!isNavigable}
                    type="button"
                    onClick={() => onStepChange?.(STEP_ENTRY[name])}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                        isCurrent && 'border-primary bg-primary text-primary-foreground',
                        isComplete && 'border-primary/40 bg-primary/10 text-primary',
                        !isCurrent && !isComplete && 'border-border text-muted-foreground'
                      )}
                    >
                      {isComplete ? <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        'whitespace-nowrap',
                        isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground hidden sm:inline'
                      )}
                    >
                      {t(STEP_LABELS[name])}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <Card.Title className="text-lg">{title}</Card.Title>
            <Card.Description>{description}</Card.Description>
          </div>
          {aside}
        </div>
        {children}
      </div>
      {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-4">{footer}</div>}
    </Card>
  );
};

export type { WizardStepName };

export { StepLayout, WIZARD_STEPS };
