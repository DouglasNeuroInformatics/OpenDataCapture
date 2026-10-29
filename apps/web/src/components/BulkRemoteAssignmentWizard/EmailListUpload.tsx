import React, { useState } from 'react';

import { Button, FileDropzone, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon, MailIcon, XCircleIcon } from 'lucide-react';

import {
  assertFileSize,
  BulkParseFailure,
  downloadCsv,
  isWorkbookFile,
  parseEmailListText,
  parseEmailListWorkbook,
  resolveEmailList
} from '@/utils/bulk-assignments';
import type { BulkParseError, CanonicalField, EmailListParseResult, SubjectEmails } from '@/utils/bulk-assignments';

import { ColumnFieldSelect } from './ColumnFieldSelect';
import { WizardTable } from './WizardTable';

/** The only two columns this panel reads; the rest of a file the user uploads is ignored. */
const EMAIL_LIST_FIELDS = ['subjectId', 'email'] as const satisfies readonly CanonicalField[];

type EmailField = (typeof EMAIL_LIST_FIELDS)[number];

type WarningLineProps = {
  /** The already-translated message. */
  message: string;
  /** What the message counted, revealed when the line is opened. */
  subjects: string[];
  testId: string;
};

/**
 * A warning that can be opened to name the subjects behind its count, so the operator can act on it
 * without reopening the file.
 */
const WarningLine = ({ message, subjects, testId }: WarningLineProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ToggleIcon = isOpen ? ChevronUpIcon : ChevronDownIcon;
  return (
    <div className="flex flex-col gap-1">
      <button
        className="text-destructive flex items-center gap-1.5 text-left text-xs font-medium"
        data-testid={testId}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <XCircleIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        {message}
        <ToggleIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      </button>
      {isOpen && (
        <ul className="text-destructive ml-5 list-disc text-xs" data-testid={`${testId}-subjects`}>
          {subjects.map((subject) => (
            <li key={subject}>{subject}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

type StepBubbleProps = {
  step: number;
};

const StepBubble = ({ step }: StepBubbleProps) => (
  <span
    className="border-primary bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
    data-testid={`email-list-step-${step}`}
  >
    {step}
  </span>
);

type EmailListUploadProps = {
  /** Every address the wizard currently holds, so the panel can report the selection's gaps. */
  emails: SubjectEmails;
  groupName: string;
  knownSubjectIds: string[];
  onEmailsMerged: (emails: SubjectEmails) => void;
  selectedIds: string[];
};

export const EmailListUpload = ({
  emails,
  groupName,
  knownSubjectIds,
  onEmailsMerged,
  selectedIds
}: EmailListUploadProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState<BulkParseError[]>([]);
  const [parsed, setParsed] = useState<EmailListParseResult | null>(null);
  const [mapping, setMapping] = useState<Partial<{ [key: string]: EmailField }>>({});
  // The addresses the last applied file resolved, rather than a count of them: every message is
  // derived from this and the current selection, so changing the selection re-reports the same file.
  const [appliedEmails, setAppliedEmails] = useState<null | SubjectEmails>(null);
  const [unmatchedSubjects, setUnmatchedSubjects] = useState<string[]>([]);
  const [missingEmailSubjects, setMissingEmailSubjects] = useState<string[]>([]);

  const run = async (parse: () => EmailListParseResult | Promise<EmailListParseResult>) => {
    setErrors([]);
    setAppliedEmails(null);
    try {
      const result = await parse();
      setParsed(result);
      const autoMapping: Partial<{ [key: string]: EmailField }> = {};
      for (const [header, field] of Object.entries(result.mapping)) {
        if (field === 'subjectId' || field === 'email') {
          autoMapping[header] = field;
        }
      }
      setMapping(autoMapping);
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
      return isWorkbookFile(file)
        ? parseEmailListWorkbook(file)
        : (assertFileSize(file), parseEmailListText(await file.text()));
    });
  };

  const claimed = new Set(Object.values(mapping).filter((field): field is EmailField => Boolean(field)));

  const hasSubjectId = claimed.has('subjectId');
  const hasEmail = claimed.has('email');

  const setHeaderField = (header: string, field: CanonicalField | undefined) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (field === 'subjectId' || field === 'email') {
        next[header] = field;
      } else {
        delete next[header];
      }
      return next;
    });
  };

  const handleApplyMapping = () => {
    const {
      emails: resolved,
      missingEmail,
      unmatched
    } = resolveEmailList(parsed!.rows, mapping, { groupName, knownSubjectIds });
    const count = Object.keys(resolved).length;
    if (count === 0) {
      setErrors([
        {
          message: t({
            en: 'No subject IDs in the file matched a subject in this group.',
            es: 'Ningún identificador de sujeto del archivo coincide con un sujeto de este grupo.',
            fr: 'Aucun identifiant de sujet du fichier ne correspond à un sujet de ce groupe.'
          })
        }
      ]);
      return;
    }
    onEmailsMerged(resolved);
    setAppliedEmails(resolved);
    setUnmatchedSubjects(unmatched);
    setMissingEmailSubjects(missingEmail);
    setParsed(null);
    setMapping({});
    setExpanded(false);
  };

  const handleDownloadTemplate = () => {
    const rows = selectedIds.map((id) => `${removeSubjectIdScope(id)},`);
    downloadCsv(`subject_id,email\r\n${rows.join('\r\n')}`, 'email-list-template.csv');
  };

  // Derived from the wizard's own addresses rather than from the merge, so it also counts an address
  // typed straight into the subject table and stays right as the selection changes.
  const missingSubjects = selectedIds.filter((id) => !emails[id]?.trim());
  // With nothing selected the file speaks for itself; with a selection, only the part of it that
  // bears on the subjects the wizard will actually assign.
  const matchedSubjects = Object.keys(appliedEmails ?? {}).filter(
    (id) => selectedIds.length === 0 || selectedIds.includes(id)
  );
  // A selected subject the file left blank is already named by the warning above, which says the
  // same thing about the same subject. This one is for the rest of the file.
  const fileMissingEmailSubjects = missingEmailSubjects.filter((id) => !missingSubjects.includes(id));

  const ToggleIcon = expanded ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4" data-testid="email-list-upload">
      <button
        className="flex w-full items-center gap-2 text-left text-sm font-medium"
        data-testid="email-list-upload-toggle"
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <MailIcon className="text-muted-foreground h-4 w-4" />
        {t({
          en: 'Emails for Assignment Links (Optional)',
          es: 'Correos para los enlaces de asignación (opcional)',
          fr: 'Courriels pour les liens d’affectation (facultatif)'
        })}
        <ToggleIcon className="text-muted-foreground ml-auto h-4 w-4" />
      </button>

      {appliedEmails !== null && !expanded && (
        <div className="flex flex-col gap-1">
          <p
            className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400"
            data-testid="email-list-matched"
          >
            <CheckCircleIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {t(
              selectedIds.length > 0
                ? {
                    en: '{} emails matched to selected subjects',
                    es: '{} correos asociados a sujetos seleccionados',
                    fr: '{} courriels associés aux sujets sélectionnés'
                  }
                : {
                    en: '{} emails matched to subjects in this group',
                    es: '{} correos asociados a sujetos de este grupo',
                    fr: '{} courriels associés à des sujets de ce groupe'
                  },
              { args: [String(matchedSubjects.length)] }
            )}
          </p>
          {missingSubjects.length > 0 && (
            <WarningLine
              message={t(
                missingSubjects.length === 1
                  ? {
                      en: 'Warning: {} selected subject does not have an email address in the uploaded file.',
                      es: 'Advertencia: {} sujeto seleccionado no tiene una dirección de correo electrónico en el archivo cargado.',
                      fr: "Avertissement : {} sujet sélectionné n'a pas d'adresse courriel dans le fichier téléversé."
                    }
                  : {
                      en: 'Warning: {} selected subjects do not have an email address in the uploaded file.',
                      es: 'Advertencia: {} sujetos seleccionados no tienen una dirección de correo electrónico en el archivo cargado.',
                      fr: "Avertissement : {} sujets sélectionnés n'ont pas d'adresse courriel dans le fichier téléversé."
                    },
                { args: [String(missingSubjects.length)] }
              )}
              subjects={missingSubjects.map((id) => removeSubjectIdScope(id))}
              testId="email-list-missing"
            />
          )}
          {fileMissingEmailSubjects.length > 0 && (
            <WarningLine
              message={t(
                fileMissingEmailSubjects.length === 1
                  ? {
                      en: 'Warning: {} subject was found in the file but is missing an email address.',
                      es: 'Advertencia: se encontró {} sujeto en el archivo, pero le falta una dirección de correo electrónico.',
                      fr: 'Avertissement : {} sujet a été trouvé dans le fichier, mais il lui manque une adresse courriel.'
                    }
                  : {
                      en: 'Warning: {} subjects were found in the file but are missing an email address.',
                      es: 'Advertencia: se encontraron {} sujetos en el archivo, pero les falta una dirección de correo electrónico.',
                      fr: 'Avertissement : {} sujets ont été trouvés dans le fichier, mais il leur manque une adresse courriel.'
                    },
                { args: [String(fileMissingEmailSubjects.length)] }
              )}
              subjects={fileMissingEmailSubjects.map((id) => removeSubjectIdScope(id))}
              testId="email-list-no-email"
            />
          )}
          {unmatchedSubjects.length > 0 && (
            <WarningLine
              message={t(
                {
                  en: '{} subjects in the file do not exist in this group',
                  es: '{} sujetos del archivo no existen en este grupo',
                  fr: "{} sujets du fichier n'existent pas dans ce groupe"
                },
                { args: [String(unmatchedSubjects.length)] }
              )}
              // As the file spells them: these match nothing, so there is no stored id to show.
              subjects={unmatchedSubjects}
              testId="email-list-unmatched"
            />
          )}
        </div>
      )}

      {expanded && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <StepBubble step={1} />
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">
                {t({
                  en: 'Download a template pre-filled with subject IDs, and add email addresses.',
                  es: 'Descargue una plantilla con los identificadores de sujeto y agregue las direcciones de correo electrónico.',
                  fr: 'Téléchargez un modèle pré-rempli avec les identifiants de sujet, et ajoutez les adresses courriel.'
                })}
              </p>
              <div className="flex items-center gap-3">
                <Button data-testid="email-list-download-template" type="button" onClick={handleDownloadTemplate}>
                  <DownloadIcon className="mr-1.5 h-4 w-4" />
                  {t(
                    {
                      en: 'Download Template ({})',
                      es: 'Descargar plantilla ({})',
                      fr: 'Télécharger le modèle ({})'
                    },
                    { args: [String(selectedIds.length)] }
                  )}
                </Button>
                {selectedIds.length === 0 && (
                  <p className="text-muted-foreground text-sm" data-testid="email-list-empty-warning">
                    {t({
                      en: 'No subjects selected - the template will be empty. Select subjects first to pre-fill it.',
                      es: 'No hay sujetos seleccionados - la plantilla estará vacía. Seleccione sujetos primero para rellenarla.',
                      fr: "Aucun sujet sélectionné - le modèle sera vide. Sélectionnez des sujets d'abord pour le pré-remplir."
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div
              className="bg-destructive text-destructive-foreground rounded-md border p-3 text-sm"
              data-testid="email-list-errors"
              role="alert"
            >
              <ul className="list-disc space-y-1 pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}

          {!parsed && (
            <div className="mt-6 flex items-start gap-3">
              <StepBubble step={2} />
              <div className="flex flex-1 flex-col gap-3">
                <p className="text-muted-foreground text-sm">
                  {t({
                    en: 'Upload the completed template.',
                    es: 'Suba la plantilla completada.',
                    fr: 'Téléversez le modèle complété.'
                  })}
                </p>
                <FileDropzone
                  acceptedFileTypes={{
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'text/csv': ['.csv'],
                    'text/tab-separated-values': ['.tsv']
                  }}
                  className="min-h-32"
                  data-testid="email-list-dropzone"
                  description=".csv, .tsv, .xlsx"
                  file={null}
                  setFile={handleFile}
                />
              </div>
            </div>
          )}

          {parsed && (
            <div className="flex flex-col gap-3">
              <WizardTable
                data-testid="email-list-mapping"
                head={
                  <React.Fragment>
                    <Table.Head>{t({ en: 'Column', es: 'Columna', fr: 'Colonne' })}</Table.Head>
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
                          data-testid={`email-list-map-${header}`}
                          fields={EMAIL_LIST_FIELDS}
                          value={field}
                          onChange={(next) => setHeaderField(header, next)}
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </WizardTable>

              <div className="flex gap-2">
                <Button
                  data-testid="email-list-apply"
                  disabled={!hasSubjectId || !hasEmail}
                  size="sm"
                  type="button"
                  onClick={handleApplyMapping}
                >
                  {t({ en: 'Apply Emails', es: 'Aplicar correos', fr: 'Appliquer les courriels' })}
                </Button>
                <Button
                  data-testid="email-list-cancel"
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setParsed(null);
                    setMapping({});
                    setErrors([]);
                  }}
                >
                  {t({ en: 'Cancel', es: 'Cancelar', fr: 'Annuler' })}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
