import React, { useState } from 'react';

import { Button, Card, ClientTable, FileDropzone, TextArea } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Subject } from '@opendatacapture/schemas/subject';

import {
  ACCEPTED_FILE_EXTENSIONS,
  assertFileSize,
  BulkParseFailure,
  isWorkbookFile,
  parseDelimitedText,
  parseWorkbook
} from '@/utils/bulk-assignments';
import type { BulkParseError, BulkParseResult } from '@/utils/bulk-assignments';

import { ErrorList } from './ErrorList';

type SourceStepProps = {
  onParsed: (parsed: BulkParseResult) => void;
  onSubjectsSelected: (subjectIds: string[]) => void;
  subjects: Subject[];
};

/**
 * A subject id that was generated from personal information is a 64-character hex digest; anything
 * else was chosen by a person. Only the latter is meaningful to pick from a list, so the picker
 * offers those and leaves hash-identified subjects to the file/paste path.
 */
const GENERATED_ID = /^[0-9a-f]{64}$/i;

export const isCustomIdentifier = (id: string) => !GENERATED_ID.test(id);

export const SourceStep = ({ onParsed, onSubjectsSelected, subjects }: SourceStepProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<BulkParseError[]>([]);
  const [pasted, setPasted] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const selectable = subjects.filter(({ id }) => isCustomIdentifier(id));

  const run = async (parse: () => BulkParseResult | Promise<BulkParseResult>) => {
    setErrors([]);
    try {
      onParsed(await parse());
    } catch (err) {
      if (err instanceof BulkParseFailure) {
        setErrors(err.errors);
        return;
      }
      throw err;
    }
  };

  const handleFile = (file: File) =>
    void run(async () => {
      assertFileSize(file);
      // The workbook parser is the only path that pulls in `xlsx`, and it does so dynamically.
      return isWorkbookFile(file) ? parseWorkbook(file) : parseDelimitedText(await file.text());
    });

  const toggle = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <div className="flex flex-col gap-6" data-testid="bulk-source-step">
      <ErrorList errors={errors} />
      <Card>
        <Card.Header>
          <Card.Title>{t({ en: 'Select subjects', fr: 'Sélectionner des sujets' })}</Card.Title>
          <Card.Description>
            {t({
              en: 'Choose existing subjects in this group that use a custom identifier.',
              fr: 'Choisissez des sujets existants de ce groupe qui utilisent un identifiant personnalisé.'
            })}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {selectable.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              {t({
                en: 'No subjects with a custom identifier are available in this group.',
                fr: 'Aucun sujet avec un identifiant personnalisé n’est disponible dans ce groupe.'
              })}
            </p>
          ) : (
            <ClientTable
              columns={[
                {
                  field: 'id',
                  label: t({ en: 'Subject', fr: 'Sujet' })
                },
                {
                  field: 'selected',
                  label: t({ en: 'Selected', fr: 'Sélectionné' })
                }
              ]}
              data={selectable.map(({ id }) => ({
                id,
                selected: selected.has(id) ? '✓' : ''
              }))}
              data-testid="bulk-subject-picker"
              onEntryClick={({ id }) => toggle(id)}
            />
          )}
        </Card.Content>
        <Card.Footer>
          <Button
            data-testid="bulk-use-selected-subjects"
            disabled={selected.size === 0}
            type="button"
            onClick={() => onSubjectsSelected([...selected])}
          >
            {t({ en: 'Continue with selected', fr: 'Continuer avec la sélection' })}
            {selected.size > 0 && ` (${selected.size})`}
          </Button>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>{t({ en: 'Upload a file', fr: 'Téléverser un fichier' })}</Card.Title>
          <Card.Description>
            {t({
              en: 'CSV, TSV or Excel. Include a subject ID column, or first name, last name, date of birth and sex.',
              fr: 'CSV, TSV ou Excel. Incluez une colonne d’identifiant, ou prénom, nom, date de naissance et sexe.'
            })}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <FileDropzone
            acceptedFileTypes={{
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'text/csv': ['.csv'],
              'text/tab-separated-values': ['.tsv']
            }}
            data-testid="bulk-file-dropzone"
            description={ACCEPTED_FILE_EXTENSIONS.join(', ')}
            file={null}
            setFile={handleFile}
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>{t({ en: 'Or paste data', fr: 'Ou coller des données' })}</Card.Title>
          <Card.Description>
            {t({
              en: 'Comma, tab or semicolon separated, with a header row.',
              fr: 'Séparé par des virgules, tabulations ou points-virgules, avec une ligne d’en-tête.'
            })}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <TextArea
            data-testid="bulk-paste-input"
            rows={6}
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
          />
        </Card.Content>
        <Card.Footer>
          <Button
            data-testid="bulk-parse-pasted"
            disabled={pasted.trim().length === 0}
            type="button"
            onClick={() => void run(() => parseDelimitedText(pasted))}
          >
            {t({ en: 'Use pasted data', fr: 'Utiliser les données collées' })}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};
