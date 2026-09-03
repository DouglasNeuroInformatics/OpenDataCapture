import React, { useState } from 'react';

import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import type { Subject } from '@opendatacapture/schemas/subject';

import { toBulkAssignmentFailure, useCreateBulkAssignmentsMutation } from '@/hooks/useBulkAssignments';
import { toResultCsv } from '@/utils/bulk-assignments';

import { MapStep } from './MapStep';
import { ReviewStep } from './ReviewStep';
import { SourceStep } from './SourceStep';
import { TimepointsStep } from './TimepointsStep';

import type { WizardState } from './types';

type InstrumentOption = { id: string; title: string };

const downloadCsv = (csv: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  anchor.download = 'bulk-remote-assignments.csv';
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
};

export type BulkRemoteAssignmentWizardProps = {
  /** Prefilled expiry for a new timepoint, as `YYYY-MM-DD`. */
  defaultExpiresAt: string;
  groupId: string;
  instruments: InstrumentOption[];
  /** Group setting controlling how much of an identifier the subject picker shows. */
  subjectIdDisplayLength: number;
  subjects: Subject[];
};

/**
 * Bulk remote assignment wizard.
 *
 * The operation is all-or-nothing end to end: the API refuses a batch it cannot create in full, so
 * there is no partial-result state to render. A refusal returns the user to review with what to fix,
 * and nothing has been created.
 *
 * Raw uploaded rows live only inside this component's state and are dropped as soon as subject ids
 * are resolved, so a reset or an unmount discards them.
 */
export const BulkRemoteAssignmentWizard = ({
  defaultExpiresAt,
  groupId,
  instruments,
  subjectIdDisplayLength,
  subjects
}: BulkRemoteAssignmentWizardProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<WizardState>({ step: 'SOURCE' });
  const [failure, setFailure] = useState<BulkAssignmentFailure | null>(null);
  const [transportError, setTransportError] = useState(false);
  const createMutation = useCreateBulkAssignmentsMutation();

  const reset = () => {
    setFailure(null);
    setTransportError(false);
    setState({ step: 'SOURCE' });
  };

  const submit = ({ allowDuplicates }: { allowDuplicates: boolean }) => {
    if (state.step !== 'REVIEW') {
      return;
    }
    setFailure(null);
    setTransportError(false);
    createMutation.mutate(
      {
        allowDuplicates,
        groupId,
        subjectIds: state.subjectIds,
        timepoints: state.timepoints.map(({ expiresAt, instrumentId }) => ({
          expiresAt: new Date(`${expiresAt}T23:59:59.999Z`),
          instrumentId
        }))
      },
      {
        onError: (error) => {
          const refusal = toBulkAssignmentFailure(error);
          if (refusal) {
            setFailure(refusal);
            return;
          }
          setTransportError(true);
        },
        onSuccess: (assignments) => {
          setState({ createdCount: assignments.length, step: 'DONE', subjectIds: state.subjectIds });
        }
      }
    );
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6" data-testid="bulk-remote-assignment-wizard">
      {state.step === 'SOURCE' && (
        <SourceStep
          subjectIdDisplayLength={subjectIdDisplayLength}
          subjects={subjects}
          onParsed={(parsed) => setState({ parsed, step: 'MAP' })}
          onSubjectsSelected={(subjectIds) => setState({ step: 'TIMEPOINTS', subjectIds })}
        />
      )}

      {state.step === 'MAP' && (
        <MapStep
          parsed={state.parsed}
          onBack={reset}
          onResolved={(subjectIds) => setState({ step: 'TIMEPOINTS', subjectIds })}
        />
      )}

      {state.step === 'TIMEPOINTS' && (
        <TimepointsStep
          defaultExpiresAt={defaultExpiresAt}
          instruments={instruments}
          subjectCount={state.subjectIds.length}
          onBack={reset}
          onConfirm={(timepoints) => setState({ step: 'REVIEW', subjectIds: state.subjectIds, timepoints })}
        />
      )}

      {state.step === 'REVIEW' && (
        <ReviewStep
          failure={failure}
          isSubmitting={createMutation.isPending}
          subjectCount={state.subjectIds.length}
          timepoints={state.timepoints}
          transportError={transportError}
          onBack={() => setState({ step: 'TIMEPOINTS', subjectIds: state.subjectIds })}
          onSubmit={submit}
        />
      )}

      {state.step === 'DONE' && (
        <div className="flex flex-col gap-4" data-testid="bulk-done-step">
          <Heading variant="h4">{t({ en: 'Assignments created', fr: 'Tâches créées' })}</Heading>
          <p className="text-sm" data-testid="bulk-created-count">
            {t({
              en: `${state.createdCount} assignments were created.`,
              fr: `${state.createdCount} tâches ont été créées.`
            })}
          </p>
          <div className="flex gap-2">
            <Button
              data-testid="bulk-download-csv"
              type="button"
              variant="outline"
              onClick={() =>
                downloadCsv(toResultCsv(state.subjectIds.map((subjectId) => ({ status: 'CREATED', subjectId }))))
              }
            >
              {t({ en: 'Download CSV', fr: 'Télécharger le CSV' })}
            </Button>
            <Button data-testid="bulk-start-over" type="button" onClick={reset}>
              {t({ en: 'Start over', fr: 'Recommencer' })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
