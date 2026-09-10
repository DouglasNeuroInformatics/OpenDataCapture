import React, { useState } from 'react';

import { Button, Checkbox } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { BulkAssignmentFailure, BulkAssignmentIssue } from '@opendatacapture/schemas/assignment';

import type { BulkParseError } from '@/utils/bulk-assignments';

import { ErrorList } from './ErrorList';
import { StepLayout } from './StepLayout';

import type { DraftTimepoint, WizardStep } from './types';

type ReviewStepProps = {
  failure: BulkAssignmentFailure | null;
  isSubmitting: boolean;
  onBack: () => void;
  onStepChange: (step: WizardStep) => void;
  onSubmit: (options: { allowDuplicates: boolean }) => void;
  subjectCount: number;
  timepoints: DraftTimepoint[];
  transportError: boolean;
};

/**
 * Render a refusal as sentences a clinician can act on. The API reports ids rather than names — it
 * has never been told the names — so a count plus the ids is all there is to show, and all that
 * should be shown.
 */
const useIssueMessages = () => {
  const { t } = useTranslation();
  return (issues: BulkAssignmentIssue[]): BulkParseError[] =>
    issues.map((issue) => {
      switch (issue.kind) {
        case 'CONFLICT':
          return {
            message: t({
              en: `${issue.conflicts.length} subject(s) already have an outstanding assignment for one of these instruments.`,
              fr: `${issue.conflicts.length} sujet(s) ont déjà une tâche en cours pour l’un de ces instruments.`
            })
          };
        case 'INSTRUMENT_UNAVAILABLE':
          return {
            message: t({
              en: `This group cannot assign ${issue.instrumentIds.length} of the selected instrument(s).`,
              fr: `Ce groupe ne peut pas attribuer ${issue.instrumentIds.length} des instruments sélectionnés.`
            })
          };
        case 'SUBJECT_UNAVAILABLE':
          return {
            message: t({
              en: `${issue.subjectIds.length} subject(s) are not available in this group.`,
              fr: `${issue.subjectIds.length} sujet(s) ne sont pas disponibles dans ce groupe.`
            })
          };
      }
    });
};

export const ReviewStep = ({
  failure,
  isSubmitting,
  onBack,
  onStepChange,
  onSubmit,
  subjectCount,
  timepoints,
  transportError
}: ReviewStepProps) => {
  const { t } = useTranslation();
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const toMessages = useIssueMessages();

  const hasConflict = failure?.issues.some(({ kind }) => kind === 'CONFLICT') ?? false;
  const messages = failure ? toMessages(failure.issues) : [];
  if (transportError) {
    messages.push({
      message: t({
        en: 'The request could not be completed. Nothing has been created.',
        fr: 'La requête n’a pas pu être complétée. Rien n’a été créé.'
      })
    });
  }

  return (
    <StepLayout
      aside={
        <span className="text-sm font-medium" data-testid="bulk-review-summary">
          {t({
            en: `${subjectCount * timepoints.length} assignments`,
            fr: `${subjectCount * timepoints.length} tâches`
          })}
        </span>
      }
      description={t({
        en: 'All assignments are created together. If any of them cannot be created, none are.',
        fr: 'Toutes les tâches sont créées ensemble. Si l’une d’elles échoue, aucune n’est créée.'
      })}
      footer={
        <React.Fragment>
          <Button disabled={isSubmitting} type="button" variant="outline" onClick={onBack}>
            {t({ en: 'Back', fr: 'Retour' })}
          </Button>
          <Button
            data-testid="bulk-submit"
            disabled={isSubmitting || (hasConflict && !allowDuplicates)}
            type="button"
            onClick={() => onSubmit({ allowDuplicates })}
          >
            {t({ en: 'Create assignments', fr: 'Créer les tâches' })}
          </Button>
        </React.Fragment>
      }
      step="REVIEW"
      title={t({ en: 'Review and create', fr: 'Réviser et créer' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-4" data-testid="bulk-review-step">
        <ErrorList errors={messages} />

        <div className="rounded-md border p-4">
          <p className="mb-2 text-sm font-medium">
            {t({
              en: `${subjectCount} subjects × ${timepoints.length} instruments`,
              fr: `${subjectCount} sujets × ${timepoints.length} instruments`
            })}
          </p>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {timepoints.map((timepoint) => {
              const summary = `${timepoint.instrumentTitle} — ${timepoint.expiresAt}`;
              return <li key={timepoint.instrumentId}>{summary}</li>;
            })}
          </ul>
        </div>

        {hasConflict && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={allowDuplicates}
              data-testid="bulk-allow-duplicates"
              onCheckedChange={(checked) => setAllowDuplicates(checked === true)}
            />
            {t({
              en: 'Assign anyway, creating a second assignment for those subjects',
              fr: 'Attribuer quand même, en créant une seconde tâche pour ces sujets'
            })}
          </label>
        )}
      </div>
    </StepLayout>
  );
};
