import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Checkbox, DataTable, FileDropzone, Tabs, TextArea } from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from 'lucide-react';

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

type PickerRow = {
  dateOfBirth: string;
  id: string;
  sex: string;
  subject: string;
};

/**
 * A clickable column label. `DataTableHead` renders whatever the column supplies, so the sort
 * affordance lives here rather than coming from the table.
 */
const SortableHeader = ({ column, label }: { column: TanstackTable.Column<PickerRow>; label: string }) => {
  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ChevronUpIcon : sorted === 'desc' ? ChevronDownIcon : ChevronsUpDownIcon;
  return (
    <button
      className="hover:text-foreground flex items-center gap-1 transition-colors"
      type="button"
      onClick={() => column.toggleSorting()}
    >
      {label}
      <Icon className={cn('h-3.5 w-3.5', !sorted && 'opacity-40')} />
    </button>
  );
};

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
  // rendered the way the rest of the app renders them - group scope removed, truncated to the group's
  // display length - with date of birth and sex alongside, since a digest identifies nobody on sight.
  const rows: PickerRow[] = subjects.map((subject) => ({
    dateOfBirth: subject.dateOfBirth ? toBasicISOString(subject.dateOfBirth) : t({ en: 'NULL', fr: 'NUL' }),
    id: subject.id,
    sex: subject.sex ?? '',
    subject: removeSubjectIdScope(subject.id).slice(0, subjectIdDisplayLength)
  }));

  const allShownSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));

  const toggleAllShown = () => {
    const next = new Set(selected);
    for (const row of rows) {
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
            <p className="text-muted-foreground text-sm">
              {t({
                en: 'Choose existing subjects in this group. Search, sort or filter to narrow the list.',
                fr: 'Choisissez des sujets existants de ce groupe. Cherchez, triez ou filtrez pour réduire la liste.'
              })}
            </p>
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                {t({ en: 'This group has no subjects.', fr: 'Ce groupe n’a aucun sujet.' })}
              </p>
            ) : (
              <div data-testid="bulk-subject-picker">
                <DataTable
                  columns={[
                    {
                      cell: ({ row }) => (
                        <Checkbox
                          aria-label={row.original.subject}
                          checked={selected.has(row.original.id)}
                          data-testid={`bulk-select-subject-${row.original.id}`}
                          onCheckedChange={() => toggle(row.original.id)}
                        />
                      ),
                      enableSorting: false,
                      header: () => (
                        <Checkbox
                          aria-label={t({ en: 'Select all shown', fr: 'Tout sélectionner' })}
                          checked={allShownSelected}
                          data-testid="bulk-select-all-subjects"
                          onCheckedChange={toggleAllShown}
                        />
                      ),
                      id: 'select'
                    },
                    {
                      accessorKey: 'subject',
                      header: ({ column }) => (
                        <SortableHeader column={column} label={t('datahub.index.table.subject')} />
                      ),
                      id: 'subject'
                    },
                    {
                      accessorKey: 'dateOfBirth',
                      header: ({ column }) => (
                        <SortableHeader column={column} label={t('core.identificationData.dateOfBirth.label')} />
                      ),
                      id: 'dateOfBirth'
                    },
                    {
                      accessorKey: 'sex',
                      cell: ({ getValue }) => {
                        const value = getValue<string>();
                        if (value === 'FEMALE') {
                          return t('core.identificationData.sex.female');
                        }
                        if (value === 'MALE') {
                          return t('core.identificationData.sex.male');
                        }
                        return t({ en: 'NULL', fr: 'NUL' });
                      },
                      header: ({ column }) => (
                        <SortableHeader column={column} label={t('core.identificationData.sex.label')} />
                      ),
                      id: 'sex'
                    }
                  ]}
                  data={rows}
                  onRowClick={(row) => toggle(row.id)}
                />
              </div>
            )}
            <div className="mt-3 flex justify-center">
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
