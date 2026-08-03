import type { Language, LocalizedString } from '@opendatacapture/schemas/core';

import { LANGUAGES } from './language';

/** Whether a body string contains a given `{{variable}}` placeholder. */
function hasVar(body: string, name: string): boolean {
  return new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`).test(body);
}

/**
 * The languages the author has touched in either field. Any entry counts, even whitespace: a
 * blank-but-present body must be reported as incomplete, not silently dropped at save time.
 */
function touchedLanguages(subject: LocalizedString, body: LocalizedString): Language[] {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- an empty string is untouched; fall through intentionally
  return LANGUAGES.filter((code) => subject[code] || body[code]);
}

/** Placeholders a remote-assignment email template may use. */
export const ASSIGNMENT_TEMPLATE_VARS = ['url', 'expiresAt'] as const;

/** Placeholders the new-user welcome template may use, and the subset it must use. */
export const NEW_USER_TEMPLATE_VARS = ['firstName', 'lastName', 'username', 'group', 'url'] as const;
export const REQUIRED_NEW_USER_TEMPLATE_VARS = ['username'] as const;

export type TemplateIssue = 'incomplete' | 'missing-vars' | null;

/**
 * What (if anything) is wrong with a template for the given languages:
 * `incomplete` when a required language's subject/body is blank,
 * `missing-vars` when the body omits a required variable, otherwise `null`.
 * When no `languages` are supplied, checks every language the subject or body has been touched
 * in — so authoring one field without the other, in any language, is caught as incomplete.
 */
export function checkTemplateIssue(
  subject: LocalizedString,
  body: LocalizedString,
  requiredVars: readonly string[],
  languages?: readonly Language[]
): TemplateIssue {
  const targets = languages ?? touchedLanguages(subject, body);
  if (targets.length === 0) {
    return 'incomplete';
  }
  for (const language of targets) {
    const localizedSubject = subject[language];
    const localizedBody = body[language];
    if (!localizedSubject?.trim() || !localizedBody?.trim()) {
      return 'incomplete';
    }
    if (requiredVars.some((name) => !hasVar(localizedBody, name))) {
      return 'missing-vars';
    }
  }
  return null;
}
