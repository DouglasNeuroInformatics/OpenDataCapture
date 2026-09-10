import React, { useState } from 'react';

import { Badge, Button, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BULK_ASSIGNMENT_MAX_SUBJECTS } from '@opendatacapture/schemas/assignment';

import { BulkParseFailure, resolveSubjectIds } from '@/utils/bulk-assignments';
import type { BulkParseError, BulkParseResult } from '@/utils/bulk-assignments';

import { ErrorList } from './ErrorList';
import { StepLayout } from './StepLayout';

const FIELD_LABELS = {
  dateOfBirth: { en: 'Date of birth', fr: 'Date de naissance' },
  firstName: { en: 'First name', fr: 'Prénom' },
  lastName: { en: 'Last name', fr: 'Nom' },
  sex: { en: 'Sex at birth', fr: 'Sexe à la naissance' },
  subjectId: { en: 'Subject ID', fr: 'Identifiant du sujet' }
} as const;

import type { WizardStep } from './types';

type MapStepProps = {
  groupName: string;
  onBack: () => void;
  onResolved: (subjectIds: string[]) => void;
  onStepChange: (step: WizardStep) => void;
  parsed: BulkParseResult;
};

export const MapStep = ({ groupName, onBack, onResolved, onStepChange, parsed }: MapStepProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<BulkParseError[]>([]);

  const resolve = async () => {
    setErrors([]);
    try {
      onResolved(await resolveSubjectIds(parsed, { groupName, maxSubjects: BULK_ASSIGNMENT_MAX_SUBJECTS }));
    } catch (err) {
      if (err instanceof BulkParseFailure) {
        setErrors(err.errors);
        return;
      }
      throw err;
    }
  };

  return (
    <StepLayout
      aside={
        <Badge data-testid="bulk-detected-mode" variant="secondary">
          {parsed.mode === 'ID'
            ? t({ en: 'Subject ID', fr: 'Identifiant du sujet' })
            : t({ en: 'Personal information', fr: 'Renseignements personnels' })}
        </Badge>
      }
      description={t({
        en: `Check that the columns were read correctly. ${parsed.rows.length} rows found.`,
        fr: `Vérifiez que les colonnes ont été lues correctement. ${parsed.rows.length} lignes trouvées.`
      })}
      footer={
        <React.Fragment>
          <Button type="button" variant="outline" onClick={onBack}>
            {t({ en: 'Back', fr: 'Retour' })}
          </Button>
          <Button data-testid="bulk-confirm-mapping" type="button" onClick={() => void resolve()}>
            {t({ en: 'Continue', fr: 'Continuer' })}
          </Button>
        </React.Fragment>
      }
      step="SUBJECTS"
      title={t({ en: 'Confirm the columns', fr: 'Confirmer les colonnes' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-4" data-testid="bulk-map-step">
        <ErrorList errors={errors} />

        {parsed.mode === 'PII' && (
          <p className="text-muted-foreground text-sm">
            {t({
              en: 'Subject identifiers are derived in your browser. The personal information in this file is never sent.',
              fr: 'Les identifiants sont dérivés dans votre navigateur. Les renseignements personnels de ce fichier ne sont jamais envoyés.'
            })}
          </p>
        )}

        <div className="flex flex-col gap-2" data-testid="bulk-column-mapping">
          <h3 className="text-sm font-medium">{t({ en: 'Column mapping', fr: 'Correspondance des colonnes' })}</h3>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <Table.Header className="bg-secondary [&_th]:text-secondary-foreground [&_th]:font-semibold">
                <Table.Row>
                  <Table.Head>{t({ en: 'Column in your file', fr: 'Colonne de votre fichier' })}</Table.Head>
                  <Table.Head>{t({ en: 'Read as', fr: 'Interprétée comme' })}</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {parsed.headers.map((header) => {
                  const field = parsed.mapping[header];
                  return (
                    <Table.Row key={header}>
                      <Table.Cell className="font-medium">{header}</Table.Cell>
                      <Table.Cell className={field ? undefined : 'text-muted-foreground italic'}>
                        {field ? t(FIELD_LABELS[field]) : t({ en: 'Not used', fr: 'Non utilisée' })}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">
            {t({
              en: `Preview of the first ${parsed.preview.length} rows`,
              fr: `Aperçu des ${parsed.preview.length} premières lignes`
            })}
          </h3>
          {/* Table primitives rather than ClientTable: the preview is capped at a handful of rows,
              and ClientTable renders a pagination footer whose controls are permanently disabled. */}
          <div className="overflow-x-auto rounded-md border" data-testid="bulk-preview-table">
            <Table>
              <Table.Header className="bg-secondary [&_th]:text-secondary-foreground [&_th]:font-semibold">
                <Table.Row>
                  {parsed.headers.map((header) => (
                    <Table.Head key={header}>{header}</Table.Head>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {parsed.preview.map((row, index) => (
                  <Table.Row key={index}>
                    {parsed.headers.map((header) => (
                      <Table.Cell key={header}>{row[header]}</Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
