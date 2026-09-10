import React, { useState } from 'react';

import { Button, CopyButton, Table } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

import { toBulkAssignmentFailure, useCreateBulkAssignmentsMutation } from '@/hooks/useBulkAssignments';
import type { BulkParseResult } from '@/utils/bulk-assignments';
import { buildResultRows, resultCsvFilename, toLinkTable, toResultCsv } from '@/utils/bulk-assignments';

import { MapStep } from './MapStep';
import { ReviewStep } from './ReviewStep';
import { SourceStep } from './SourceStep';
import { StepLayout } from './StepLayout';
import { TimepointsStep } from './TimepointsStep';

import type { CreatedAssignment, DraftTimepoint, WizardStep } from './types';

type InstrumentOption = { id: string; title: string };

const downloadCsv = (csv: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  anchor.download = resultCsvFilename(new Date());
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
  // Each piece of the batch is held here rather than in the step that edits it, so moving between
  // steps — by Back or by breadcrumb — never discards work the user has already done.
  const [step, setStep] = useState<WizardStep>('SOURCE');
  const [parsed, setParsed] = useState<BulkParseResult | null>(null);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [timepoints, setTimepoints] = useState<DraftTimepoint[]>([]);
  const [assignments, setAssignments] = useState<CreatedAssignment[]>([]);
  const [sourceRows, setSourceRows] = useState<undefined | { [subjectId: string]: { [column: string]: string } }>();
  const [failure, setFailure] = useState<BulkAssignmentFailure | null>(null);
  const [transportError, setTransportError] = useState(false);
  const createMutation = useCreateBulkAssignmentsMutation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [didCopy, setDidCopy] = useState(false);

  /**
   * `navigator.clipboard` is absent outside a secure context, so an instance served over plain http
   * has no clipboard at all. Say so rather than failing silently — these links are the only record
   * of what was just created, and the CSV is the way out.
   */
  const copyLinks = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(toLinkTable(assignments));
      setDidCopy(true);
    } catch {
      addNotification({
        message: t({
          en: 'Could not copy to the clipboard. Download the CSV instead.',
          fr: 'Impossible de copier dans le presse-papiers. Téléchargez plutôt le CSV.'
        }),
        type: 'error'
      });
    }
  };

  const goTo = (next: WizardStep) => {
    setFailure(null);
    setTransportError(false);
    setStep(next);
  };

  const submit = ({ allowDuplicates }: { allowDuplicates: boolean }) => {
    setFailure(null);
    setTransportError(false);
    createMutation.mutate(
      {
        allowDuplicates,
        groupId,
        subjectIds,
        timepoints: timepoints.map(({ expiresAt, instrumentId }) => ({
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
        onSuccess: (created) => {
          setAssignments(created);
          setStep('DONE');
        }
      }
    );
  };

  return (
    <div className="mx-auto flex max-w-[70rem] flex-col gap-6" data-testid="bulk-remote-assignment-wizard">
      {step === 'SOURCE' && (
        <SourceStep
          selectedIds={subjectIds}
          subjectIdDisplayLength={subjectIdDisplayLength}
          subjects={subjects}
          onParsed={(result) => {
            setParsed(result);
            goTo('MAP');
          }}
          onSelectedChange={setSubjectIds}
          onStepChange={goTo}
          onSubjectsSelected={(ids) => {
            // Picked by hand, so there are no uploaded rows to echo back; clear any left from a
            // file the user parsed and then abandoned, which would no longer line up.
            setParsed(null);
            setSourceRows(undefined);
            setSubjectIds(ids);
            goTo('TIMEPOINTS');
          }}
        />
      )}

      {step === 'MAP' && parsed && (
        <MapStep
          parsed={parsed}
          onBack={() => goTo('SOURCE')}
          onResolved={(ids) => {
            setSubjectIds(ids);
            // `resolveSubjectIds` preserves row order, so each id belongs to the row at its index.
            setSourceRows(Object.fromEntries(ids.map((id, index) => [id, parsed.rows[index] ?? {}])));
            goTo('TIMEPOINTS');
          }}
          onStepChange={goTo}
        />
      )}

      {step === 'TIMEPOINTS' && (
        <TimepointsStep
          defaultExpiresAt={defaultExpiresAt}
          instruments={instruments}
          subjectCount={subjectIds.length}
          timepoints={timepoints}
          onBack={() => goTo('SOURCE')}
          onChange={setTimepoints}
          onConfirm={() => goTo('REVIEW')}
          onStepChange={goTo}
        />
      )}

      {step === 'REVIEW' && (
        <ReviewStep
          failure={failure}
          isSubmitting={createMutation.isPending}
          subjectCount={subjectIds.length}
          timepoints={timepoints}
          transportError={transportError}
          onBack={() => goTo('TIMEPOINTS')}
          onStepChange={goTo}
          onSubmit={submit}
        />
      )}

      {step === 'DONE' && (
        <StepLayout
          description={t({
            en: 'Each subject has a link below. Copy them, or download a CSV to share with whoever is sending them out.',
            fr: 'Chaque sujet a un lien ci-dessous. Copiez-les ou téléchargez un CSV à transmettre à la personne qui les enverra.'
          })}
          footer={
            <React.Fragment>
              <Button
                data-testid="bulk-copy-links"
                type="button"
                variant="outline"
                onClick={() => void copyLinks()}
                onMouseLeave={() => setDidCopy(false)}
              >
                {didCopy ? t({ en: 'Copied', fr: 'Copié' }) : t({ en: 'Copy all links', fr: 'Copier tous les liens' })}
              </Button>
              <Button
                data-testid="bulk-download-csv"
                type="button"
                onClick={() =>
                  downloadCsv(
                    toResultCsv(
                      buildResultRows({
                        assignments,
                        instrumentTitleById: Object.fromEntries(instruments.map(({ id, title }) => [id, title])),
                        sourceRowBySubjectId: sourceRows
                      })
                    )
                  )
                }
              >
                {t({ en: 'Download CSV', fr: 'Télécharger le CSV' })}
              </Button>
            </React.Fragment>
          }
          step={null}
          title={t({
            en: `${assignments.length} assignments created`,
            fr: `${assignments.length} tâches créées`
          })}
        >
          <div className="max-h-96 overflow-auto rounded-md border" data-testid="bulk-done-step">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>{t('datahub.index.table.subject')}</Table.Head>
                  <Table.Head>{t({ en: 'Link', fr: 'Lien' })}</Table.Head>
                  <Table.Head className="w-12" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {assignments.map((assignment) => (
                  <Table.Row key={assignment.url}>
                    <Table.Cell className="font-medium">
                      {removeSubjectIdScope(assignment.subjectId).slice(0, subjectIdDisplayLength)}
                    </Table.Cell>
                    <Table.Cell className="text-muted-foreground max-w-0 truncate text-xs" title={assignment.url}>
                      {assignment.url}
                    </Table.Cell>
                    <Table.Cell>
                      <CopyButton size="icon" text={assignment.url} variant="outline" />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </StepLayout>
      )}
    </div>
  );
};
