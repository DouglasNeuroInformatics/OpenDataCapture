import React, { useState } from 'react';

import { Badge, Button, Select, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BULK_ASSIGNMENT_MAX_SUBJECTS } from '@opendatacapture/schemas/assignment';

import { BulkParseFailure, detectMode, resolveSubjectIds } from '@/utils/bulk-assignments';
import type { BulkParseError, BulkParseResult, BulkSourceMode, CanonicalField } from '@/utils/bulk-assignments';

import { ErrorList } from './ErrorList';
import { StepLayout } from './StepLayout';
import { WizardTable } from './WizardTable';

import type { WizardStep } from './types';

const CANONICAL_FIELDS: CanonicalField[] = ['subjectId', 'firstName', 'lastName', 'dateOfBirth', 'sex'];

const FIELD_LABELS: { [K in CanonicalField]: { en: string; es: string; fr: string } } = {
  dateOfBirth: { en: 'Date of Birth', es: 'Fecha de nacimiento', fr: 'Date de naissance' },
  firstName: { en: 'First Name', es: 'Nombre', fr: 'Prénom' },
  lastName: { en: 'Last Name', es: 'Apellido', fr: 'Nom' },
  sex: { en: 'Sex at Birth', es: 'Sexo al nacer', fr: 'Sexe à la naissance' },
  subjectId: { en: 'Subject ID', es: 'Identificador del sujeto', fr: 'Identifiant du sujet' }
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

  const resolve = async (sourceMode: BulkSourceMode) => {
    setErrors([]);
    const resolvedParsed: BulkParseResult = { ...parsed, mapping, mode: sourceMode };
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
              ? t({ en: 'Subject ID', es: 'Identificador del sujeto', fr: 'Identifiant du sujet' })
              : t({ en: 'Personal Information', es: 'Información personal', fr: 'Renseignements personnels' })}
          </Badge>
        ) : null
      }
      description={t({
        en: `Check that the columns were read correctly. ${parsed.rows.length} rows found.`,
        es: `Compruebe que las columnas se leyeron correctamente. Se encontraron ${parsed.rows.length} filas.`,
        fr: `Vérifiez que les colonnes ont été lues correctement. ${parsed.rows.length} lignes trouvées.`
      })}
      footer={
        <React.Fragment>
          <Button type="button" variant="outline" onClick={onBack}>
            {t({ en: 'Back', es: 'Atrás', fr: 'Retour' })}
          </Button>
          <Button
            data-testid="bulk-confirm-mapping"
            disabled={!mode}
            type="button"
            onClick={mode ? () => void resolve(mode) : undefined}
          >
            {t({ en: 'Continue', es: 'Continuar', fr: 'Continuer' })}
          </Button>
        </React.Fragment>
      }
      step="SUBJECTS"
      title={t({ en: 'Confirm the Columns', es: 'Confirmar las columnas', fr: 'Confirmer les colonnes' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-6" data-testid="bulk-map-step">
        <ErrorList errors={errors} />

        {mode === 'PII' && (
          <p className="text-muted-foreground text-sm">
            {t({
              en: 'Subject identifiers are derived in your browser. The personal information in this file is never sent.',
              es: 'Los identificadores de los sujetos se derivan en su navegador. La información personal de este archivo nunca se envía.',
              fr: 'Les identifiants sont dérivés dans votre navigateur. Les renseignements personnels de ce fichier ne sont jamais envoyés.'
            })}
          </p>
        )}

        <div className="flex flex-col gap-2" data-testid="bulk-column-mapping">
          <h3 className="text-sm font-medium">
            {t({ en: 'Column Mapping', es: 'Correspondencia de columnas', fr: 'Correspondance des colonnes' })}
          </h3>
          <WizardTable
            head={
              <React.Fragment>
                <Table.Head>
                  {t({ en: 'Column in Your File', es: 'Columna de su archivo', fr: 'Colonne de votre fichier' })}
                </Table.Head>
                <Table.Head>{t({ en: 'Read As', es: 'Interpretada como', fr: 'Interprétée comme' })}</Table.Head>
              </React.Fragment>
            }
          >
            {parsed.headers.map((header) => {
              const field = mapping[header];
              return (
                <Table.Row key={header}>
                  <Table.Cell className="font-medium">{header}</Table.Cell>
                  <Table.Cell className="py-2">
                    <Select value={field ?? NOT_USED} onValueChange={(value) => setHeaderField(header, value)}>
                      <Select.Trigger
                        className={field ? 'w-48' : 'text-muted-foreground w-48 italic'}
                        data-testid={`bulk-map-select-${header}`}
                      >
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value={NOT_USED}>
                          {t({ en: 'Not Used', es: 'No utilizada', fr: 'Non utilisée' })}
                        </Select.Item>
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
          </WizardTable>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">
            {t({
              en: `Preview of the first ${parsed.preview.length} rows`,
              es: `Vista previa de las primeras ${parsed.preview.length} filas`,
              fr: `Aperçu des ${parsed.preview.length} premières lignes`
            })}
          </h3>
          <WizardTable
            data-testid="bulk-preview-table"
            head={parsed.headers.map((header) => (
              <Table.Head key={header}>{header}</Table.Head>
            ))}
          >
            {parsed.preview.map((row, index) => (
              <Table.Row key={index}>
                {parsed.headers.map((header) => (
                  <Table.Cell key={header}>{row[header]}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </WizardTable>
        </div>
      </div>
    </StepLayout>
  );
};
