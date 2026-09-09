import React, { useState } from 'react';

import { Badge, Button, ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BULK_ASSIGNMENT_MAX_SUBJECTS } from '@opendatacapture/schemas/assignment';

import { BulkParseFailure, resolveSubjectIds } from '@/utils/bulk-assignments';
import type { BulkParseError, BulkParseResult } from '@/utils/bulk-assignments';

import { ErrorList } from './ErrorList';
import { StepLayout } from './StepLayout';

type MapStepProps = {
  onBack: () => void;
  onResolved: (subjectIds: string[]) => void;
  parsed: BulkParseResult;
};

export const MapStep = ({ onBack, onResolved, parsed }: MapStepProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<BulkParseError[]>([]);

  const resolve = async () => {
    setErrors([]);
    try {
      onResolved(await resolveSubjectIds(parsed, { maxSubjects: BULK_ASSIGNMENT_MAX_SUBJECTS }));
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

        <div className="flex flex-wrap gap-2" data-testid="bulk-column-mapping">
          {parsed.headers.map((header) => (
            <Badge key={header} variant={parsed.mapping[header] ? 'default' : 'outline'}>
              {header}
              {parsed.mapping[header] ? ` → ${parsed.mapping[header]}` : ` (${t({ en: 'ignored', fr: 'ignorée' })})`}
            </Badge>
          ))}
        </div>

        <ClientTable
          columns={parsed.headers.map((header) => ({ field: header, label: header }))}
          data={parsed.preview}
          data-testid="bulk-preview-table"
        />
      </div>
    </StepLayout>
  );
};
