import React, { useState } from 'react';

import { Badge, Button, Checkbox, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BULK_ASSIGNMENT_MAX_SUBJECTS } from '@opendatacapture/schemas/assignment';

import { BulkParseFailure, detectMode, resolveSubjectIds } from '@/utils/bulk-assignments';
import type {
  BulkParseError,
  BulkParseResult,
  BulkSourceMode,
  CanonicalField,
  SubjectIdResolution
} from '@/utils/bulk-assignments';

import { ColumnFieldSelect } from './ColumnFieldSelect';
import { ErrorList } from './ErrorList';
import { StepLayout } from './StepLayout';
import { WizardTable } from './WizardTable';

import type { WizardStep } from './types';

const CANONICAL_FIELDS: CanonicalField[] = ['subjectId', 'firstName', 'lastName', 'dateOfBirth', 'sex', 'email'];

type MapStepProps = {
  groupName: string;
  knownSubjectIds: string[];
  onBack: () => void;
  /** The kept rows travel with their ids, so a skipped row cannot shift the pairing. */
  onResolved: (subjectIds: string[], rows: BulkParseResult['rows']) => void;
  onStepChange: (step: WizardStep) => void;
  parsed: BulkParseResult;
};

export const MapStep = ({ groupName, knownSubjectIds, onBack, onResolved, onStepChange, parsed }: MapStepProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<BulkParseError[]>([]);
  const [mapping, setMapping] = useState<Partial<{ [key: string]: CanonicalField }>>(parsed.mapping);
  // The rows this group cannot place, once a resolve has found some, and whether the user has said
  // to leave them out. Held across a second press of Continue, which is how the choice is made.
  const [unplaceableRowCount, setUnplaceableRowCount] = useState(0);
  const [skipUnplaceable, setSkipUnplaceable] = useState(false);

  const mode: BulkSourceMode | null = detectMode(mapping);

  const claimed = new Set(Object.values(mapping).filter((field): field is CanonicalField => Boolean(field)));

  const setHeaderField = (header: string, field: CanonicalField | undefined) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (field) {
        next[header] = field;
      } else {
        delete next[header];
      }
      return next;
    });
  };

  const rowLabel = (rowNumber: number) => {
    return t({ en: `Row ${rowNumber}`, es: `Fila ${rowNumber}`, fr: `Ligne ${rowNumber}` });
  };

  /**
   * The group cannot place every row: the file may name a subject it does not have, or an identifier
   * too short to name one in particular. Reported here rather than left to the API three steps
   * later, and offered as a skip rather than a dead end, so one stray row does not cost the batch.
   */
  const unplaceableWarnings = ({ ambiguousRows, unknownRows }: SubjectIdResolution): BulkParseError[] => {
    const warnings: BulkParseError[] = [];
    if (unknownRows.length > 0) {
      warnings.push({
        items: unknownRows.map(rowLabel),
        message: t({
          en: `${unknownRows.length} row(s) name a subject this group does not have:`,
          es: `${unknownRows.length} fila(s) nombran a un sujeto que este grupo no tiene:`,
          fr: `${unknownRows.length} ligne(s) nomment un sujet que ce groupe n’a pas :`
        })
      });
    }
    if (ambiguousRows.length > 0) {
      warnings.push({
        items: ambiguousRows.map(rowLabel),
        message: t({
          en: `${ambiguousRows.length} row(s) hold an identifier matching more than one subject in this group:`,
          es: `${ambiguousRows.length} fila(s) tienen un identificador que coincide con más de un sujeto de este grupo:`,
          fr: `${ambiguousRows.length} ligne(s) portent un identifiant correspondant à plus d’un sujet de ce groupe :`
        })
      });
    }
    return warnings;
  };

  const resolve = async (sourceMode: BulkSourceMode) => {
    setErrors([]);
    const resolvedParsed: BulkParseResult = { ...parsed, mapping, mode: sourceMode };
    try {
      const resolution = await resolveSubjectIds(resolvedParsed, {
        groupName,
        knownSubjectIds,
        maxSubjects: BULK_ASSIGNMENT_MAX_SUBJECTS
      });
      const unplaceableCount = resolution.ambiguousRows.length + resolution.unknownRows.length;
      setUnplaceableRowCount(unplaceableCount);
      if (unplaceableCount > 0 && !skipUnplaceable) {
        setErrors(unplaceableWarnings(resolution));
        return;
      }
      if (resolution.matched.length === 0) {
        setErrors([
          ...unplaceableWarnings(resolution),
          {
            message: t({
              en: 'No row names a subject this group has, so there is nothing to assign.',
              es: 'Ninguna fila nombra a un sujeto de este grupo, así que no hay nada que asignar.',
              fr: 'Aucune ligne ne nomme un sujet de ce groupe : il n’y a rien à attribuer.'
            })
          }
        ]);
        return;
      }
      onResolved(
        resolution.matched.map(({ id }) => id),
        // The header is row 1, so a row number indexes the data rows one further back.
        resolution.matched.map(({ rowNumber }) => parsed.rows[rowNumber - 2]!)
      );
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
        {mode === 'PII' && (
          <p className="text-muted-foreground text-sm">
            {t({
              en: 'Subject identifiers are derived in your browser. The personal information in this file is never sent.',
              es: 'Los identificadores de los sujetos se derivan en su navegador. La información personal de este archivo nunca se envía.',
              fr: 'Les identifiants sont dérivés dans votre navigateur. Les renseignements personnels de ce fichier ne sont jamais envoyés.'
            })}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">
            {t({ en: 'Column Mapping', es: 'Correspondencia de columnas', fr: 'Correspondance des colonnes' })}
          </h3>
          <WizardTable
            className="max-h-112 overflow-y-auto"
            data-testid="bulk-column-mapping"
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
                    <ColumnFieldSelect
                      claimed={claimed}
                      data-testid={`bulk-map-select-${header}`}
                      fields={CANONICAL_FIELDS}
                      value={field}
                      onChange={(next) => setHeaderField(header, next)}
                    />
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

        {/* Last in the body, so a refusal sits directly above Continue rather than above the
            mapping the user has scrolled past. */}
        <ErrorList errors={errors} />

        {unplaceableRowCount > 0 && (
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Checkbox
              checked={skipUnplaceable}
              data-testid="bulk-skip-unplaceable"
              onCheckedChange={(checked) => setSkipUnplaceable(checked === true)}
            />
            {t({
              en: `Leave out the ${unplaceableRowCount} row(s) this group cannot place and continue with the rest`,
              es: `Omitir las ${unplaceableRowCount} fila(s) que este grupo no puede ubicar y continuar con el resto`,
              fr: `Laisser de côté les ${unplaceableRowCount} ligne(s) que ce groupe ne peut pas placer et continuer avec le reste`
            })}
          </label>
        )}
      </div>
    </StepLayout>
  );
};
