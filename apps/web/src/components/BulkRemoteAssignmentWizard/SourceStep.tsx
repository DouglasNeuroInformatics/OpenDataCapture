import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Checkbox, DataTable, FileDropzone, Input, TextArea } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { BULK_ASSIGNMENT_MAX_SUBJECTS } from '@opendatacapture/schemas/assignment';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

import { SectionTabs } from '@/components/SectionTabs';
import { SortableHeader } from '@/components/SortableHeader';
import {
  ACCEPTED_FILE_EXTENSIONS,
  assertFileSize,
  BulkParseFailure,
  isWorkbookFile,
  parseDelimitedText,
  parseWorkbook
} from '@/utils/bulk-assignments';
import type { BulkParseError, BulkParseResult, SubjectEmails } from '@/utils/bulk-assignments';

import { EmailListUpload } from './EmailListUpload';
import { ErrorList } from './ErrorList';
import { StepLayout } from './StepLayout';

import type { SourceMode, WizardStep } from './types';

type PickerRow = {
  dateOfBirth: string;
  id: string;
  sex: string;
  subject: string;
};

type SourceStepProps = {
  emails: SubjectEmails;
  groupName: string;
  isMailEnabled: boolean;
  /** Held by the wizard, so Back from the mapping step returns to the tab the data came from. */
  mode: SourceMode;
  onBack?: () => void;
  onEmailsChange: (emails: SubjectEmails) => void;
  onModeChange: (mode: SourceMode) => void;
  onParsed: (parsed: BulkParseResult) => void;
  onPastedChange: (pasted: string) => void;
  /** Selection is held by the wizard, so stepping away and back does not discard it. */
  onSelectedChange: (subjectIds: string[]) => void;
  onStepChange: (step: WizardStep) => void;
  onSubjectsSelected: (subjectIds: string[], emails: SubjectEmails) => void;
  /** Held by the wizard for the same reason as the tab: Back returns to the text, not an empty box. */
  pasted: string;
  selectedIds: string[];
  /** Group setting controlling how much of an identifier is shown, as elsewhere in the app. */
  subjectIdDisplayLength: number;
  subjects: Subject[];
};

export const SourceStep = ({
  emails,
  groupName,
  isMailEnabled,
  mode,
  onBack,
  onEmailsChange,
  onModeChange,
  onParsed,
  onPastedChange,
  onSelectedChange,
  onStepChange,
  onSubjectsSelected,
  pasted,
  selectedIds,
  subjectIdDisplayLength,
  subjects
}: SourceStepProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<BulkParseError[]>([]);
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

  const handleFile = (file: File) => {
    return void run(async () => {
      assertFileSize(file);
      // The workbook parser is the only path that pulls in `xlsx`, and it does so dynamically.
      return isWorkbookFile(file) ? parseWorkbook(file) : parseDelimitedText(await file.text());
    });
  };

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
    { label: t({ en: 'Select Subjects', es: 'Seleccionar sujetos', fr: 'Sélectionner des sujets' }), value: 'SELECT' },
    { label: t({ en: 'Upload a File', es: 'Cargar un archivo', fr: 'Téléverser un fichier' }), value: 'FILE' },
    { label: t({ en: 'Paste Data', es: 'Pegar datos', fr: 'Coller des données' }), value: 'PASTE' }
  ];

  // Both tabs read the same columns, so they state the same expectation. The email column is named
  // only where mail is configured, since the wizard ignores it otherwise.
  const formatHint = (
    <p className="text-muted-foreground text-sm" data-testid="bulk-source-format-hint">
      {[
        t({
          en: 'Comma, tab or semicolon separated, with a header row. Include a subject ID column, or first name, last name, date of birth and sex.',
          es: 'Separado por comas, tabulaciones o puntos y comas, con una fila de encabezado. Incluya una columna de identificador de sujeto, o nombre, apellido, fecha de nacimiento y sexo.',
          fr: "Séparé par des virgules, tabulations ou points-virgules, avec une ligne d'en-tête. Incluez une colonne d'identifiant, ou prénom, nom, date de naissance et sexe."
        }),
        ...(isMailEnabled
          ? [
              t({
                en: 'An email column is optional.',
                es: 'Una columna de correo electrónico es opcional.',
                fr: 'Une colonne de courriel est facultative.'
              })
            ]
          : [])
      ].join(' ')}
    </p>
  );

  // Every subject in the group is listed, not only those with a chosen identifier: a hash-identified
  // subject is just as assignable, and excluding them left most of a group invisible. Identifiers are
  // rendered the way the rest of the app renders them - group scope removed, truncated to the group's
  // display length - with date of birth and sex alongside, since a digest identifies nobody on sight.
  const rows: PickerRow[] = subjects.map((subject) => ({
    dateOfBirth: subject.dateOfBirth ? toBasicISOString(subject.dateOfBirth) : t({ en: 'NULL', es: 'NULO', fr: 'NUL' }),
    id: subject.id,
    sex: subject.sex ?? '',
    subject: removeSubjectIdScope(subject.id).slice(0, subjectIdDisplayLength)
  }));

  const toggleFiltered = (filteredRows: PickerRow[]) => {
    const allSelected = filteredRows.length > 0 && filteredRows.every((row) => selected.has(row.id));
    const next = new Set(selected);
    for (const row of filteredRows) {
      if (allSelected) {
        next.delete(row.id);
      } else {
        next.add(row.id);
      }
    }
    onSelectedChange([...next]);
  };

  const backButton = onBack && (
    <Button className="mr-auto" type="button" variant="outline" onClick={onBack}>
      {t({ en: 'Back', es: 'Volver', fr: 'Retour' })}
    </Button>
  );

  const footers: { [K in SourceMode]: React.ReactNode } = {
    FILE: backButton ?? null,
    PASTE: (
      <React.Fragment>
        {backButton}
        <Button
          data-testid="bulk-parse-pasted"
          disabled={pasted.trim().length === 0}
          type="button"
          onClick={() => void run(() => parseDelimitedText(pasted))}
        >
          {t({ en: 'Use Pasted Data', es: 'Usar los datos pegados', fr: 'Utiliser les données collées' })}
        </Button>
      </React.Fragment>
    ),
    SELECT: (
      <React.Fragment>
        {backButton}
        {selected.size > BULK_ASSIGNMENT_MAX_SUBJECTS && (
          <p className="text-destructive mr-auto text-sm">
            {t({
              en: `Selection is limited to ${BULK_ASSIGNMENT_MAX_SUBJECTS} subjects`,
              es: `La selección está limitada a ${BULK_ASSIGNMENT_MAX_SUBJECTS} sujetos`,
              fr: `La sélection est limitée à ${BULK_ASSIGNMENT_MAX_SUBJECTS} sujets`
            })}
          </p>
        )}
        <Button
          data-testid="bulk-use-selected-subjects"
          disabled={selected.size === 0 || selected.size > BULK_ASSIGNMENT_MAX_SUBJECTS}
          type="button"
          onClick={() => onSubjectsSelected([...selected], emails)}
        >
          {t({ en: 'Continue With Selected', es: 'Continuar con la selección', fr: 'Continuer avec la sélection' })}
          {selected.size > 0 && ` (${selected.size})`}
        </Button>
      </React.Fragment>
    )
  };

  return (
    <StepLayout
      description={t({
        en: 'Assign one or more instruments to many subjects at once. Every assignment is created together.',
        es: 'Asigne uno o varios instrumentos a muchos sujetos a la vez. Todas las tareas remotas se crean juntas.',
        fr: 'Attribuez un ou plusieurs instruments à plusieurs sujets à la fois. Toutes les tâches sont créées ensemble.'
      })}
      footer={footers[mode]}
      step="SUBJECTS"
      title={t({ en: 'Choose Subjects', es: 'Elegir los sujetos', fr: 'Choisir les sujets' })}
      onStepChange={onStepChange}
    >
      <div className="flex flex-col gap-4" data-testid="bulk-source-step">
        <SectionTabs
          data-testid="bulk-source-mode"
          tabs={modes}
          value={mode}
          onValueChange={(value) => {
            setErrors([]);
            onModeChange(value);
          }}
        />

        {mode === 'SELECT' && (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              {t({
                en: 'Choose existing subjects in this group. Search, sort or filter to narrow the list.',
                es: 'Elija sujetos existentes de este grupo. Busque, ordene o filtre para reducir la lista.',
                fr: 'Choisissez des sujets existants de ce groupe. Cherchez, triez ou filtrez pour réduire la liste.'
              })}
            </p>
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                {t({
                  en: 'This group has no subjects.',
                  es: 'Este grupo no tiene sujetos.',
                  fr: "Ce groupe n'a aucun sujet."
                })}
              </p>
            ) : (
              <React.Fragment>
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
                        header: ({ table }) => {
                          const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original);
                          const allFilteredSelected =
                            filteredRows.length > 0 && filteredRows.every((row) => selected.has(row.id));
                          return (
                            <Checkbox
                              aria-label={t({
                                en: 'Select All Shown',
                                es: 'Seleccionar todo lo mostrado',
                                fr: 'Tout sélectionner'
                              })}
                              checked={allFilteredSelected}
                              data-testid="bulk-select-all-subjects"
                              onCheckedChange={() => toggleFiltered(filteredRows)}
                            />
                          );
                        },
                        id: 'select',
                        maxSize: 40,
                        size: 40
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
                          return t({ en: 'NULL', es: 'NULO', fr: 'NUL' });
                        },
                        header: ({ column }) => (
                          <SortableHeader column={column} label={t('core.identificationData.sex.label')} />
                        ),
                        id: 'sex'
                      },
                      ...(isMailEnabled
                        ? [
                            {
                              cell: ({ row }: { row: { original: PickerRow } }) => (
                                <Input
                                  className="h-8 min-w-40"
                                  data-testid={`bulk-email-${row.original.id}`}
                                  placeholder={t({ en: 'Email', es: 'Correo', fr: 'Courriel' })}
                                  type="email"
                                  value={emails[row.original.id] ?? ''}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    onEmailsChange({ ...emails, [row.original.id]: event.target.value });
                                  }}
                                  onClick={(event: React.MouseEvent) => event.stopPropagation()}
                                />
                              ),
                              enableSorting: false,
                              header: () => t({ en: 'Email', es: 'Correo electrónico', fr: 'Courriel' }),
                              id: 'email',
                              minSize: 200,
                              size: 220
                            }
                          ]
                        : [])
                    ]}
                    data={rows}
                    onRowClick={(row) => toggle(row.id)}
                  />
                </div>
                {isMailEnabled && (
                  <EmailListUpload
                    emails={emails}
                    groupName={groupName}
                    knownSubjectIds={subjects.map((subject) => subject.id)}
                    selectedIds={selectedIds}
                    onEmailsMerged={(merged) => onEmailsChange({ ...emails, ...merged })}
                  />
                )}
              </React.Fragment>
            )}
          </div>
        )}

        {mode === 'FILE' && (
          <div className="flex flex-col gap-3">
            {formatHint}
            <FileDropzone
              acceptedFileTypes={{
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'text/csv': ['.csv'],
                'text/tab-separated-values': ['.tsv']
              }}
              className="bg-background min-h-72"
              data-testid="bulk-file-dropzone"
              description={ACCEPTED_FILE_EXTENSIONS.join(', ')}
              file={null}
              setFile={handleFile}
            />
          </div>
        )}

        {mode === 'PASTE' && (
          <div className="flex flex-col gap-3">
            {formatHint}
            <TextArea
              className="bg-background min-h-72"
              data-testid="bulk-paste-input"
              rows={8}
              value={pasted}
              onChange={(event) => onPastedChange(event.target.value)}
            />
          </div>
        )}

        {/* Last in the body, so a refusal sits directly above the action that produced it rather
            than above the input the user is still looking at. */}
        <ErrorList errors={errors} />
      </div>
    </StepLayout>
  );
};
