import { useState } from 'react';

import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

import type {
  CreatedAssignment,
  DraftTimepoint,
  SourceMode,
  WizardStep
} from '@/components/BulkRemoteAssignmentWizard/types';
import {
  toBulkAssignmentFailure,
  useBulkAssignmentPreflightMutation,
  useCreateBulkAssignmentsMutation
} from '@/hooks/useBulkAssignments';
import type { BulkParseResult, CanonicalField, SubjectEmails } from '@/utils/bulk-assignments';
import { buildResultRows, toResultTsv, unavailableSubjectIds } from '@/utils/bulk-assignments';

type InstrumentOption = { id: string; title: string };

type UseBulkAssignmentWizardOptions = {
  groupId: string;
  instruments: InstrumentOption[];
  subjectIdDisplayLength: number;
};

/**
 * Every piece of the batch the wizard is assembling, held in one place rather than in the step that
 * edits it, so moving between steps - by Back or by breadcrumb - never discards work already done.
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
  const [columnMapping, setColumnMapping] = useState<Partial<{ [key: string]: CanonicalField }>>({});
  const [failure, setFailure] = useState<BulkAssignmentFailure | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [emails, setEmails] = useState<SubjectEmails>({});
  const [didCopy, setDidCopy] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>('SELECT');
  const [pastedText, setPastedText] = useState('');
  const preflightMutation = useBulkAssignmentPreflightMutation();
  const createMutation = useCreateBulkAssignmentsMutation();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const goTo = (next: WizardStep) => {
    setFailure(null);
    setTransportError(false);
    setStep(next);
  };

  const toPayload = (allowDuplicates: boolean, ids: string[] = subjectIds) => ({
    allowDuplicates,
    groupId,
    subjectIds: ids,
    timepoints: timepoints.map(({ expiresAt, instrumentId }) => ({
      expiresAt: new Date(`${expiresAt}T23:59:59.999Z`),
      instrumentId
    }))
  });

  /**
   * Name a subject the way the user will recognise it. When the batch came from a file, that is the
   * row they supplied; a derived identifier is a hash and would tell them nothing about who it is.
   */
  const identifyingHeaders = new Set(
    Object.entries(columnMapping)
      .filter(([, field]) => field === 'subjectId' || field === 'firstName' || field === 'lastName')
      .map(([header]) => header)
  );

  const describeSubject = (subjectId: string) => {
    const row = sourceRows?.[subjectId];
    if (!row) {
      return removeSubjectIdScope(subjectId).slice(0, subjectIdDisplayLength);
    }
    const headers = identifyingHeaders.size > 0 ? identifyingHeaders : new Set(Object.keys(row));
    const supplied = [...headers]
      .map((header) => row[header])
      .filter(Boolean)
      .join(' · ');
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
      // http has no clipboard at all. Say so rather than failing silently - these links are the only
      // record of what was just created, and the CSV is the way out.
      if (!navigator.clipboard) {
        addNotification({
          message: t({
            en: 'Could not copy to the clipboard. Download the CSV instead.',
            es: 'No se pudo copiar al portapapeles. Descargue el CSV en su lugar.',
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
    emails,
    failure,
    goTo,
    isPreflighting: preflightMutation.isPending,
    isSubmitting: createMutation.isPending,
    parsed,
    pastedText,
    /** Subject ids resolved from the mapped columns, in the row order they were supplied. */
    resolveMapping: (ids: string[], rows: BulkParseResult['rows'], mapping: BulkParseResult['mapping']) => {
      setSubjectIds(ids);
      setSourceRows(Object.fromEntries(ids.map((id, index) => [id, rows[index] ?? {}])));
      setColumnMapping(mapping);
      const emailHeader = Object.keys(mapping).find((header) => mapping[header] === 'email');
      if (emailHeader) {
        const extracted: SubjectEmails = {};
        for (const [index, id] of ids.entries()) {
          const value = rows[index]?.[emailHeader]?.trim();
          if (value) {
            extracted[id] = value;
          }
        }
        setEmails(extracted);
      } else {
        setEmails({});
      }
      goTo('TIMEPOINTS');
    },
    resultRows,
    selectSubjects: (ids: string[], subjectEmails: SubjectEmails) => {
      setParsed(null);
      setSourceRows(undefined);
      setColumnMapping({});
      setSubjectIds(ids);
      setEmails(subjectEmails);
      goTo('TIMEPOINTS');
    },
    setEmails,
    setPastedText,
    setSelectedSubjectIds: setSubjectIds,
    setSourceMode,
    setTimepoints,
    sourceMode,
    /**
     * Begin a batch with nothing carried over. Stepping back keeps work on purpose, so the only way
     * to a genuinely empty wizard is to say so - otherwise the next batch starts holding the last
     * one's subjects, timepoints and addresses.
     */
    startOver: () => {
      setParsed(null);
      setSubjectIds([]);
      setTimepoints([]);
      setAssignments([]);
      setSourceRows(undefined);
      setColumnMapping({});
      setEmails({});
      setDidCopy(false);
      setSourceMode('SELECT');
      setPastedText('');
      goTo('SOURCE');
    },
    step,
    subjectIds,
    submit: ({ allowDuplicates, skipUnavailable }: { allowDuplicates: boolean; skipUnavailable: boolean }) => {
      let ids = subjectIds;
      if (skipUnavailable) {
        const unavailable = new Set(unavailableSubjectIds(failure));
        ids = subjectIds.filter((id) => !unavailable.has(id));
      }
      setFailure(null);
      setTransportError(false);
      const submittedIds = new Set(ids);
      createMutation.mutate(toPayload(allowDuplicates, ids), {
        onError: (error) => {
          const refusal = toBulkAssignmentFailure(error);
          if (refusal) {
            setFailure(refusal);
            return;
          }
          setTransportError(true);
        },
        onSuccess: (created) => {
          setAssignments(created.filter((assignment) => submittedIds.has(assignment.subjectId)));
          setEmails((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => submittedIds.has(id))));
          setStep('DONE');
        }
      });
    },
    timepoints,
    transportError
  };
}
