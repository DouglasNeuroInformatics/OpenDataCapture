import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  Button,
  Checkbox,
  FileDropzone,
  SearchBar,
  Table,
  Tabs,
  TextArea
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

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
import { StepLayout } from './StepLayout';

import type { WizardStep } from './types';

type SourceMode = 'FILE' | 'PASTE' | 'SELECT';

type SourceStepProps = {
  onParsed: (parsed: BulkParseResult) => void;
  /** Selection is held by the wizard, so stepping away and back does not discard it. */
  onSelectedChange: (subjectIds: string[]) => void;
  onStepChange: (step: WizardStep) => void;
  onSubjectsSelected: (subjectIds: string[]) => void;
  selectedIds: string[];
  /** Group setting controlling how much of an identifier is shown, as elsewhere in the app. */
  subjectIdDisplayLength: number;
  subjects: Subject[];
};

export const SourceStep = ({
  onParsed,
  onSelectedChange,
  onStepChange,
  onSubjectsSelected,
  selectedIds,
  subjectIdDisplayLength,
  subjects
}: SourceStepProps) => {
  const { t } = useTranslation();
  // One source at a time: offering all three at once left it unclear which the wizard would act on,
  // and a file dropped while text was pasted had no defined precedence.
  const [mode, setMode] = useState<SourceMode>('SELECT');
  const [errors, setErrors] = useState<BulkParseError[]>([]);
  const [pasted, setPasted] = useState('');
  const [search, setSearch] = useState('');
  const selected = new Set(selectedIds);

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

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectedChange([...next]);
  };

  const modes: { label: string; value: SourceMode }[] = [
    { label: t({ en: 'Select subjects', fr: 'Sélectionner des sujets' }), value: 'SELECT' },
    { label: t({ en: 'Upload a file', fr: 'Téléverser un fichier' }), value: 'FILE' },
    { label: t({ en: 'Paste data', fr: 'Coller des données' }), value: 'PASTE' }
  ];

  // Every subject in the group is listed, not only those with a chosen identifier: a hash-identified
  // subject is just as assignable, and excluding them left most of a group invisible. Identifiers are
  // rendered the way the rest of the app renders them — group scope removed, truncated to the group's
  // display length — with date of birth and sex alongside, since a digest identifies nobody on sight.
  const rows = subjects.map((subject) => ({
    dateOfBirth: subject.dateOfBirth ? toBasicISOString(subject.dateOfBirth) : t({ en: 'NULL', fr: 'NUL' }),
    id: subject.id,
    sex:
      subject.sex === 'FEMALE'
        ? t('core.identificationData.sex.female')
        : subject.sex === 'MALE'
          ? t('core.identificationData.sex.male')
          : t({ en: 'NULL', fr: 'NUL' }),
    subject: removeSubjectIdScope(subject.id).slice(0, subjectIdDisplayLength)
  }));

  const query = search.trim().toLowerCase();
  const filtered = query
    ? rows.filter((row) => [row.subject, row.dateOfBirth, row.sex].some((value) => value.toLowerCase().includes(query)))
    : rows;

  const allShownSelected = filtered.length > 0 && filtered.every((row) => selected.has(row.id));

  const toggleAllShown = () => {
    const next = new Set(selected);
    for (const row of filtered) {
      if (allShownSelected) {
        next.delete(row.id);
      } else {
        next.add(row.id);
      }
    }
    onSelectedChange([...next]);
  };

  return (
    <StepLayout
      description={t({
        en: 'Assign one or more instruments to many subjects at once. Every assignment is created together.',
        fr: 'Attribuez un ou plusieurs instruments à plusieurs sujets à la fois. Toutes les tâches sont créées ensemble.'
      })}
      step="SUBJECTS"
      title={t({ en: 'Choose subjects', fr: 'Choisir les sujets' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-4" data-testid="bulk-source-step">
        <ErrorList errors={errors} />

        <Tabs
          value={mode}
          onValueChange={(value) => {
            setErrors([]);
            setMode(value as SourceMode);
          }}
        >
          <Tabs.List className="w-fit" data-testid="bulk-source-mode">
            {modes.map((option) => (
              <Tabs.Trigger
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid={`bulk-source-mode-${option.value}`}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>

        {mode === 'SELECT' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm">
                {t({
                  en: 'Choose existing subjects in this group.',
                  fr: 'Choisissez des sujets existants de ce groupe.'
                })}
              </p>
              <SearchBar
                className="w-full sm:w-72"
                data-testid="bulk-subject-search"
                placeholder={t({ en: 'Search subjects...', fr: 'Rechercher des sujets...' })}
                value={search}
                onValueChange={setSearch}
              />
            </div>
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                {t({ en: 'This group has no subjects.', fr: 'Ce groupe n’a aucun sujet.' })}
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                {t({ en: 'No subjects match your search.', fr: 'Aucun sujet ne correspond à votre recherche.' })}
              </p>
            ) : (
              <div className="max-h-96 overflow-auto rounded-md border" data-testid="bulk-subject-picker">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head className="w-10">
                        <Checkbox
                          aria-label={t({ en: 'Select all shown', fr: 'Tout sélectionner' })}
                          checked={allShownSelected}
                          data-testid="bulk-select-all-subjects"
                          onCheckedChange={toggleAllShown}
                        />
                      </Table.Head>
                      <Table.Head>{t('datahub.index.table.subject')}</Table.Head>
                      <Table.Head>{t('core.identificationData.dateOfBirth.label')}</Table.Head>
                      <Table.Head>{t('core.identificationData.sex.label')}</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filtered.map((row) => {
                      const isSelected = selected.has(row.id);
                      return (
                        // `data-state` drives the row highlight libui already defines for a selected row,
                        // rather than a colour invented here.
                        <Table.Row
                          className="cursor-pointer"
                          data-state={isSelected ? 'selected' : undefined}
                          key={row.id}
                          onClick={() => toggle(row.id)}
                        >
                          <Table.Cell className="w-10">
                            <Checkbox
                              aria-label={row.subject}
                              checked={isSelected}
                              data-testid={`bulk-select-subject-${row.subject}`}
                              onCheckedChange={() => toggle(row.id)}
                            />
                          </Table.Cell>
                          <Table.Cell className="font-medium">{row.subject}</Table.Cell>
                          <Table.Cell>{row.dateOfBirth}</Table.Cell>
                          <Table.Cell>{row.sex}</Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              </div>
            )}
            <div className="flex justify-center">
              <Button
                data-testid="bulk-use-selected-subjects"
                disabled={selected.size === 0}
                type="button"
                onClick={() => onSubjectsSelected([...selected])}
              >
                {t({ en: 'Continue with selected', fr: 'Continuer avec la sélection' })}
                {selected.size > 0 && ` (${selected.size})`}
              </Button>
            </div>
          </div>
        )}

        {mode === 'FILE' && (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              {t({
                en: 'CSV, TSV or Excel. Include a subject ID column, or first name, last name, date of birth and sex.',
                fr: 'CSV, TSV ou Excel. Incluez une colonne d’identifiant, ou prénom, nom, date de naissance et sexe.'
              })}
            </p>
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
          </div>
        )}

        {mode === 'PASTE' && (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              {t({
                en: 'Comma, tab or semicolon separated, with a header row. Include a subject ID column, or first name, last name, date of birth and sex.',
                fr: 'Séparé par des virgules, tabulations ou points-virgules, avec une ligne d’en-tête. Incluez une colonne d’identifiant, ou prénom, nom, date de naissance et sexe.'
              })}
            </p>
            <TextArea
              data-testid="bulk-paste-input"
              rows={8}
              value={pasted}
              onChange={(event) => setPasted(event.target.value)}
            />
            <div className="flex justify-center">
              <Button
                data-testid="bulk-parse-pasted"
                disabled={pasted.trim().length === 0}
                type="button"
                onClick={() => void run(() => parseDelimitedText(pasted))}
              >
                {t({ en: 'Use pasted data', fr: 'Utiliser les données collées' })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
};
