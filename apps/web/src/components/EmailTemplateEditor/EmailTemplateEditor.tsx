import React from 'react';

import { Button, Input, Label, Select, TextArea } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';
import type { MailTemplate } from '@opendatacapture/schemas/mail';

/**
 * The `satisfies` keeps this in step with {@link Language}: adding a language fails to compile
 * until it is named here, which is also what supplies the ordered list of authorable languages.
 */
export const LANGUAGE_LABELS = {
  en: { en: 'English', fr: 'Anglais' },
  fr: { en: 'French', fr: 'Français' }
} as const satisfies { [L in Language]: { en: string; fr: string } };

export const LANGUAGES = Object.keys(LANGUAGE_LABELS) as Language[];

export type EmailTemplateEditorProps = {
  error?: string;
  /** Namespaces the control ids and test ids, so two editors can coexist on one page. */
  idPrefix: string;
  onChange: (template: MailTemplate) => void;
  readOnly?: boolean;
  template: MailTemplate;
  /** Placeholder names offered as insert buttons above the body. */
  variables?: readonly string[];
};

/** Authors the per-language subject and body of an email template. */
export const EmailTemplateEditor = ({
  error,
  idPrefix,
  onChange,
  readOnly = false,
  template,
  variables = []
}: EmailTemplateEditorProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const [language, setLanguage] = React.useState<Language>(resolvedLanguage);
  // Where the caret was when the body last lost focus, so an inserted placeholder lands there
  // rather than always at the end.
  const bodyCursorRef = React.useRef<null | { end: number; start: number }>(null);

  const body = template.body[language] ?? '';
  const subject = template.subject[language] ?? '';

  const insertVariable = (variable: string) => {
    const tag = `{{${variable}}}`;
    const cursor = bodyCursorRef.current;
    if (cursor === null) {
      onChange({ ...template, body: { ...template.body, [language]: body ? `${body} ${tag}` : tag } });
      return;
    }
    bodyCursorRef.current = { end: cursor.start + tag.length, start: cursor.start + tag.length };
    onChange({
      ...template,
      body: { ...template.body, [language]: body.slice(0, cursor.start) + tag + body.slice(cursor.end) }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-language`}>{t({ en: 'Language', fr: 'Langue' })}</Label>
        <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
          <Select.Trigger className="w-[180px]" data-testid={`${idPrefix}-language`} id={`${idPrefix}-language`}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {LANGUAGES.map((code) => (
                <Select.Item key={code} value={code}>
                  {t(LANGUAGE_LABELS[code])}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-subject`}>{t({ en: 'Subject', fr: 'Objet' })}</Label>
        <Input
          data-testid={`${idPrefix}-subject`}
          id={`${idPrefix}-subject`}
          readOnly={readOnly}
          value={subject}
          onChange={(event) =>
            onChange({ ...template, subject: { ...template.subject, [language]: event.target.value } })
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor={`${idPrefix}-body`}>{t({ en: 'Body', fr: 'Corps' })}</Label>
          {!readOnly && variables.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-xs">{t({ en: 'Insert:', fr: 'Insérer :' })}</span>
              {variables.map((variable) => {
                // Placeholder syntax, not copy — it must render verbatim in every language.
                const tag = `{{${variable}}}`;
                return (
                  <Button
                    className="h-6 px-2 font-mono text-xs"
                    data-testid={`${idPrefix}-insert-${variable}`}
                    key={variable}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => insertVariable(variable)}
                  >
                    {tag}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        <TextArea
          className="min-h-[15rem]"
          data-testid={`${idPrefix}-body`}
          id={`${idPrefix}-body`}
          readOnly={readOnly}
          value={body}
          onBlur={(event: React.FocusEvent<HTMLTextAreaElement>) => {
            bodyCursorRef.current = {
              end: event.currentTarget.selectionEnd,
              start: event.currentTarget.selectionStart
            };
          }}
          onChange={(event) => onChange({ ...template, body: { ...template.body, [language]: event.target.value } })}
        />
        {error && (
          <p className="text-destructive text-xs font-medium" data-testid={`${idPrefix}-error`}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
