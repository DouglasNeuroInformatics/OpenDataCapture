import { useState } from 'react';

import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

import type { CreatedAssignment, DraftTimepoint, WizardStep } from '@/components/BulkRemoteAssignmentWizard/types';
import {
  toBulkAssignmentFailure,
  useBulkAssignmentPreflightMutation,
  useCreateBulkAssignmentsMutation
} from '@/hooks/useBulkAssignments';
import type { BulkParseResult } from '@/utils/bulk-assignments';
import { buildResultRows, toResultTsv } from '@/utils/bulk-assignments';

type InstrumentOption = { id: string; title: string };

type UseBulkAssignmentWizardOptions = {
  groupId: string;
  instruments: InstrumentOption[];
  subjectIdDisplayLength: number;
};

/**
 * Every piece of the batch the wizard is assembling, held in one place rather than in the step that
 * edits it, so moving between steps — by Back or by breadcrumb — never discards work already done.
 *
 * Raw uploaded rows never leave this hook: they are kept only to name a subject the way the user
 * wrote it, and a reset or an unmount drops them.
 */
export function useBulkAssignmentWizard({
  groupId,
  instruments,
  subjectIdDisplayLength
}: UseBulkAssignmentWizardOptions) {
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>('SOURCE');
  const [parsed, setParsed] = useState<BulkParseResult | null>(null);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [timepoints, setTimepoints] = useState<DraftTimepoint[]>([]);
  const [assignments, setAssignments] = useState<CreatedAssignment[]>([]);
  const [sourceRows, setSourceRows] = useState<undefined | { [subjectId: string]: { [column: string]: string } }>();
  const [failure, setFailure] = useState<BulkAssignmentFailure | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [didCopy, setDidCopy] = useState(false);
  const preflightMutation = useBulkAssignmentPreflightMutation();
  const createMutation = useCreateBulkAssignmentsMutation();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const goTo = (next: WizardStep) => {
    setFailure(null);
    setTransportError(false);
    setStep(next);
  };

  const toPayload = (allowDuplicates: boolean) => ({
    allowDuplicates,
    groupId,
    subjectIds,
    timepoints: timepoints.map(({ expiresAt, instrumentId }) => ({
      expiresAt: new Date(`${expiresAt}T23:59:59.999Z`),
      instrumentId
    }))
  });

  /**
   * Name a subject the way the user will recognise it. When the batch came from a file, that is the
   * row they supplied; a derived identifier is a hash and would tell them nothing about who it is.
   */
  const describeSubject = (subjectId: string) => {
    const row = sourceRows?.[subjectId];
    // Explicit emptiness check rather than `??`: a row of blank cells joins to '', which still has
    // to fall through to the identifier.
    const supplied = row ? Object.values(row).filter(Boolean).join(' · ') : '';
    return supplied.length > 0 ? supplied : removeSubjectIdScope(subjectId).slice(0, subjectIdDisplayLength);
  };

  const resultRows = () =>
    buildResultRows({
      assignments,
      instrumentTitleById: Object.fromEntries(instruments.map(({ id, title }) => [id, title])),
      sourceRowBySubjectId: sourceRows
    });

  return {
    /** A parsed file or pasted block, which still needs its columns confirmed. */
    acceptParsed: (result: BulkParseResult) => {
      setParsed(result);
      goTo('MAP');
    },
    assignments,
    clearCopied: () => setDidCopy(false),
    confirmTimepoints: () => {
      preflightMutation.mutate(toPayload(false), {
        onError: (error) => {
          const refusal = toBulkAssignmentFailure(error);
          if (refusal) {
            setFailure(refusal);
          }
          setStep('REVIEW');
        },
        onSuccess: () => {
          setFailure(null);
          goTo('REVIEW');
        }
      });
    },
    copyLinks: async () => {
      // `navigator.clipboard` is absent outside a secure context, so an instance served over plain
      // http has no clipboard at all. Say so rather than failing silently — these links are the only
      // record of what was just created, and the CSV is the way out.
      if (!navigator.clipboard) {
        addNotification({
          message: t({
            en: 'Could not copy to the clipboard. Download the CSV instead.',
            fr: 'Impossible de copier dans le presse-papiers. Téléchargez plutôt le CSV.'
          }),
          type: 'error'
        });
        return;
      }
      await navigator.clipboard.writeText(toResultTsv(resultRows()));
      setDidCopy(true);
    },
    describeSubject,
    didCopy,
    failure,
    goTo,
    isPreflighting: preflightMutation.isPending,
    isSubmitting: createMutation.isPending,
    parsed,
    /** Subject ids resolved from the mapped columns, in the row order they were supplied. */
    resolveMapping: (ids: string[], rows: BulkParseResult['rows']) => {
      setSubjectIds(ids);
      setSourceRows(Object.fromEntries(ids.map((id, index) => [id, rows[index] ?? {}])));
      goTo('TIMEPOINTS');
    },
    resultRows,
    selectSubjects: (ids: string[]) => {
      // Picked by hand, so there are no uploaded rows to echo back; clear any left from a file the
      // user parsed and then abandoned, which would no longer line up.
      setParsed(null);
      setSourceRows(undefined);
      setSubjectIds(ids);
      goTo('TIMEPOINTS');
    },
    setSelectedSubjectIds: setSubjectIds,
    setTimepoints,
    step,
    subjectIds,
    submit: ({ allowDuplicates }: { allowDuplicates: boolean }) => {
      setFailure(null);
      setTransportError(false);
      createMutation.mutate(toPayload(allowDuplicates), {
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
      });
    },
    timepoints,
    transportError
  };
}
