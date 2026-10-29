import React from 'react';

import { Button, CopyButton, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { CheckCircleIcon, Loader2Icon, XCircleIcon } from 'lucide-react';

import { useBulkAssignmentEmail } from '@/hooks/useBulkAssignmentEmail';
import type { BulkEmailStatus } from '@/hooks/useBulkAssignmentEmail';
import { useBulkAssignmentWizard } from '@/hooks/useBulkAssignmentWizard';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { downloadCsv, resultCsvFilename, toResultCsv } from '@/utils/bulk-assignments';
import type { SubjectEmails } from '@/utils/bulk-assignments';

import { EmailAllDialog } from './EmailAllDialog';
import { MapStep } from './MapStep';
import { ReviewStep } from './ReviewStep';
import { SourceStep } from './SourceStep';
import { StepLayout } from './StepLayout';
import { TimepointsStep } from './TimepointsStep';
import { WizardTable } from './WizardTable';

import type { CreatedAssignment } from './types';

type InstrumentOption = { id: string; title: string };

/** One icon per outcome, so a new status cannot be added without a mark for it. */
const STATUS_ICONS: { [K in BulkEmailStatus]: React.ReactNode } = {
  error: <XCircleIcon className="text-destructive h-4 w-4" />,
  pending: <Loader2Icon className="text-muted-foreground h-4 w-4 animate-spin" />,
  // There is no semantic token for success in the design system; `SaveStatus` uses this same scale.
  sent: <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
};

type ResultTableProps = {
  assignments: CreatedAssignment[];
  emails: SubjectEmails;
  statuses: { [key: string]: BulkEmailStatus };
  subjectIdDisplayLength: number;
  /** Whether to show the address each link was or will be sent to, and how that went. */
  withEmail: boolean;
};

/**
 * Every created link beside the subject it belongs to. One table rather than two: with mail off, or
 * with no address anywhere in the batch, the email and outcome columns are simply absent, so the
 * link and copy columns cannot drift apart between the two cases.
 */
const ResultTable = ({ assignments, emails, statuses, subjectIdDisplayLength, withEmail }: ResultTableProps) => {
  const { t } = useTranslation();

  return (
    <WizardTable
      className="max-h-96 overflow-auto"
      data-testid={withEmail ? 'bulk-email-table' : 'bulk-done-step'}
      head={
        <React.Fragment>
          <Table.Head>{t('datahub.index.table.subject')}</Table.Head>
          {withEmail && <Table.Head>{t({ en: 'Email', es: 'Correo electrónico', fr: 'Courriel' })}</Table.Head>}
          <Table.Head>{t({ en: 'Link', es: 'Enlace', fr: 'Lien' })}</Table.Head>
          <Table.Head className="w-12" />
          {withEmail && <Table.Head className="w-8" />}
        </React.Fragment>
      }
    >
      {assignments.map((assignment) => {
        const email = emails[assignment.subjectId]?.trim();
        const status = statuses[assignment.id];
        return (
          <Table.Row key={`${assignment.subjectId}-${assignment.instrumentId}`}>
            <Table.Cell className="font-medium">
              {removeSubjectIdScope(assignment.subjectId).slice(0, subjectIdDisplayLength)}
            </Table.Cell>
            {withEmail && <Table.Cell className="text-muted-foreground text-xs">{email ?? '-'}</Table.Cell>}
            <Table.Cell className="text-muted-foreground max-w-0 truncate text-xs" title={assignment.url}>
              {assignment.url}
            </Table.Cell>
            <Table.Cell>
              <CopyButton size="icon" text={assignment.url} variant="outline" />
            </Table.Cell>
            {withEmail && <Table.Cell>{status ? STATUS_ICONS[status] : null}</Table.Cell>}
          </Table.Row>
        );
      })}
    </WizardTable>
  );
};

export type BulkRemoteAssignmentWizardProps = {
  /** Prefilled expiry for a new timepoint, as `YYYY-MM-DD`. */
  defaultExpiresAt: string;
  groupId: string;
  /** Needed to turn a pasted custom identifier back into the scoped form it is stored under. */
  groupName: string;
  instruments: InstrumentOption[];
  onBack?: () => void;
  /** Group setting controlling how much of an identifier the subject picker shows. */
  subjectIdDisplayLength: number;
  subjects: Subject[];
};

/**
 * Bulk remote assignment wizard.
 *
 * One request creates the batch, and the API refuses one it cannot create in full - so there is no
 * partial-result state to render, and a refusal returns the user to review with what to fix while
 * nothing has been created. What a batch *contains* is decided before that request: rows this group
 * cannot place can be left out at the mapping step, and subjects the API reports as unavailable can
 * be left out at review. Both narrow the batch; neither splits it.
 */
export const BulkRemoteAssignmentWizard = ({
  defaultExpiresAt,
  groupId,
  groupName,
  instruments,
  onBack,
  subjectIdDisplayLength,
  subjects
}: BulkRemoteAssignmentWizardProps) => {
  const { t } = useTranslation();
  const wizard = useBulkAssignmentWizard({ groupId, instruments, subjectIdDisplayLength });
  const setupStateQuery = useSetupStateQuery();
  const isMailEnabled = setupStateQuery.data.isMailEnabled;
  const hasEmails = Object.values(wizard.emails).some((address) => address.trim());
  const bulkEmail = useBulkAssignmentEmail({ assignments: wizard.assignments, emails: wizard.emails, groupId });

  return (
    <div className="mx-auto flex w-full max-w-280 flex-col gap-6" data-testid="bulk-remote-assignment-wizard">
      {wizard.step === 'SOURCE' && (
        <SourceStep
          emails={wizard.emails}
          groupName={groupName}
          isMailEnabled={isMailEnabled}
          mode={wizard.sourceMode}
          pasted={wizard.pastedText}
          selectedIds={wizard.subjectIds}
          subjectIdDisplayLength={subjectIdDisplayLength}
          subjects={subjects}
          onBack={onBack}
          onEmailsChange={wizard.setEmails}
          onModeChange={wizard.setSourceMode}
          onParsed={wizard.acceptParsed}
          onPastedChange={wizard.setPastedText}
          onSelectedChange={wizard.setSelectedSubjectIds}
          onStepChange={wizard.goTo}
          onSubjectsSelected={wizard.selectSubjects}
        />
      )}

      {wizard.step === 'MAP' && wizard.parsed && (
        <MapStep
          groupName={groupName}
          knownSubjectIds={subjects.map((subject) => subject.id)}
          parsed={wizard.parsed}
          onBack={() => wizard.goTo('SOURCE')}
          onResolved={(ids, rows) => wizard.resolveMapping(ids, rows, wizard.parsed!.mapping)}
          onStepChange={wizard.goTo}
        />
      )}

      {wizard.step === 'TIMEPOINTS' && (
        <TimepointsStep
          defaultExpiresAt={defaultExpiresAt}
          instruments={instruments}
          isLoading={wizard.isPreflighting}
          subjectCount={wizard.subjectIds.length}
          timepoints={wizard.timepoints}
          onBack={() => wizard.goTo('SOURCE')}
          onChange={wizard.setTimepoints}
          onConfirm={wizard.confirmTimepoints}
          onStepChange={wizard.goTo}
        />
      )}

      {wizard.step === 'REVIEW' && (
        <ReviewStep
          describeSubject={wizard.describeSubject}
          failure={wizard.failure}
          isSubmitting={wizard.isSubmitting}
          subjectCount={wizard.subjectIds.length}
          timepoints={wizard.timepoints}
          transportError={wizard.transportError}
          onBack={() => wizard.goTo('TIMEPOINTS')}
          onStepChange={wizard.goTo}
          onSubmit={wizard.submit}
        />
      )}

      {wizard.step === 'DONE' && (
        <StepLayout
          description={t({
            en: 'Each subject has a link below. Copy them, or download a CSV to share with whoever is sending them out.',
            es: 'Cada sujeto tiene un enlace a continuación. Cópielos o descargue un CSV para compartirlo con quien los enviará.',
            fr: 'Chaque sujet a un lien ci-dessous. Copiez-les ou téléchargez un CSV à transmettre à la personne qui les enverra.'
          })}
          footer={
            <React.Fragment>
              <Button
                className="mr-auto"
                data-testid="bulk-create-more"
                type="button"
                variant="outline"
                onClick={() => wizard.startOver()}
              >
                {t({ en: 'Create More', es: 'Crear más', fr: 'Créer plus' })}
              </Button>
              {isMailEnabled && hasEmails && <EmailAllDialog bulkEmail={bulkEmail} />}
              <Button
                data-testid="bulk-copy-links"
                type="button"
                variant="primary"
                onClick={() => void wizard.copyLinks()}
                onMouseLeave={wizard.clearCopied}
              >
                {wizard.didCopy
                  ? t({ en: 'Copied', es: 'Copiado', fr: 'Copié' })
                  : t({ en: 'Copy All Links', es: 'Copiar todos los enlaces', fr: 'Copier tous les liens' })}
              </Button>
              <Button
                data-testid="bulk-download-csv"
                type="button"
                onClick={() => downloadCsv(toResultCsv(wizard.resultRows()), resultCsvFilename(new Date()))}
              >
                {t({ en: 'Download CSV', es: 'Descargar el CSV', fr: 'Télécharger le CSV' })}
              </Button>
            </React.Fragment>
          }
          step={null}
          title={t({
            en: `${wizard.assignments.length} Assignments Created`,
            es: `${wizard.assignments.length} tareas creadas`,
            fr: `${wizard.assignments.length} tâches créées`
          })}
        >
          <ResultTable
            assignments={wizard.assignments}
            emails={wizard.emails}
            statuses={bulkEmail.statuses}
            subjectIdDisplayLength={subjectIdDisplayLength}
            withEmail={isMailEnabled && hasEmails}
          />
        </StepLayout>
      )}
    </div>
  );
};
