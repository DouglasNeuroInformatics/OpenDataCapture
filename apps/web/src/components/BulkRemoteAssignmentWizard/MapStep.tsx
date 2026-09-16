import React, { useState } from 'react';

import { Badge, Button, Select, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BULK_ASSIGNMENT_MAX_SUBJECTS } from '@opendatacapture/schemas/assignment';

import { BulkParseFailure, detectMode, resolveSubjectIds } from '@/utils/bulk-assignments';
import type { BulkParseError, BulkParseResult, BulkSourceMode, CanonicalField } from '@/utils/bulk-assignments';

import { ErrorList } from './ErrorList';
import { StepLayout } from './StepLayout';

import type { WizardStep } from './types';

const CANONICAL_FIELDS: CanonicalField[] = ['subjectId', 'firstName', 'lastName', 'dateOfBirth', 'sex'];

const FIELD_LABELS: { [K in CanonicalField]: { en: string; fr: string } } = {
  dateOfBirth: { en: 'Date of Birth', fr: 'Date de naissance' },
  firstName: { en: 'First Name', fr: 'Prénom' },
  lastName: { en: 'Last Name', fr: 'Nom' },
  sex: { en: 'Sex at Birth', fr: 'Sexe à la naissance' },
  subjectId: { en: 'Subject ID', fr: 'Identifiant du sujet' }
} as const;

const NOT_USED = '__not_used__';

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
  const [mapping, setMapping] = useState<Partial<{ [key: string]: CanonicalField }>>(parsed.mapping);

  const mode: BulkSourceMode | null = detectMode(mapping);

  const claimed = new Set(Object.values(mapping).filter(Boolean));

  const setHeaderField = (header: string, value: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (value === NOT_USED) {
        delete next[header];
      } else {
        next[header] = value as CanonicalField;
      }
      return next;
    });
  };

  const resolve = async () => {
    setErrors([]);
    if (!mode) {
      setErrors([
        {
          message: t({
            en: 'Map a subject ID column, or a complete set of first name, last name, date of birth and sex.',
            fr: "Associez une colonne d'identifiant, ou un ensemble complet de prénom, nom, date de naissance et sexe."
          })
        }
      ]);
      return;
    }
    const resolvedParsed: BulkParseResult = { ...parsed, mapping, mode };
    try {
      onResolved(await resolveSubjectIds(resolvedParsed, { groupName, maxSubjects: BULK_ASSIGNMENT_MAX_SUBJECTS }));
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
        mode ? (
          <Badge data-testid="bulk-detected-mode" variant="secondary">
            {mode === 'ID'
              ? t({ en: 'Subject ID', fr: 'Identifiant du sujet' })
              : t({ en: 'Personal Information', fr: 'Renseignements personnels' })}
          </Badge>
        ) : null
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
          <Button data-testid="bulk-confirm-mapping" disabled={!mode} type="button" onClick={() => void resolve()}>
            {t({ en: 'Continue', fr: 'Continuer' })}
          </Button>
        </React.Fragment>
      }
      step="SUBJECTS"
      title={t({ en: 'Confirm the Columns', fr: 'Confirmer les colonnes' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-4" data-testid="bulk-map-step">
        <ErrorList errors={errors} />

        {mode === 'PII' && (
          <p className="text-muted-foreground text-sm">
            {t({
              en: 'Subject identifiers are derived in your browser. The personal information in this file is never sent.',
              fr: 'Les identifiants sont dérivés dans votre navigateur. Les renseignements personnels de ce fichier ne sont jamais envoyés.'
            })}
          </p>
        )}

        <div className="flex flex-col gap-2" data-testid="bulk-column-mapping">
          <h3 className="text-sm font-medium">{t({ en: 'Column Mapping', fr: 'Correspondance des colonnes' })}</h3>
          <div className="overflow-hidden rounded-md border shadow-sm">
            <Table>
              <Table.Header className="bg-secondary [&_th]:text-secondary-foreground [&_th]:font-semibold">
                <Table.Row>
                  <Table.Head className="py-3">
                    {t({ en: 'Column in Your File', fr: 'Colonne de votre fichier' })}
                  </Table.Head>
                  <Table.Head className="py-3">{t({ en: 'Read As', fr: 'Interprétée comme' })}</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {parsed.headers.map((header) => {
                  const field = mapping[header];
                  return (
                    <Table.Row key={header}>
                      <Table.Cell className="py-3 font-medium">{header}</Table.Cell>
                      <Table.Cell className="py-3">
                        <Select value={field ?? NOT_USED} onValueChange={(value) => setHeaderField(header, value)}>
                          <Select.Trigger
                            className={field ? 'w-48' : 'text-muted-foreground w-48 italic'}
                            data-testid={`bulk-map-select-${header}`}
                          >
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value={NOT_USED}>{t({ en: 'Not Used', fr: 'Non utilisée' })}</Select.Item>
                            {CANONICAL_FIELDS.filter((f) => !claimed.has(f) || f === field).map((f) => (
                              <Select.Item key={f} value={f}>
                                {t(FIELD_LABELS[f])}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
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
          <div className="overflow-x-auto rounded-md border shadow-sm" data-testid="bulk-preview-table">
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
