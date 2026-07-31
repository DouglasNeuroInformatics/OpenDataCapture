import type { Language, LocalizedString } from '@opendatacapture/schemas/core';

import { authoredLanguages } from './language';

/** Whether a body string contains a given `{{variable}}` placeholder. */
function hasVar(body: string, name: string): boolean {
  return new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`).test(body);
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
 * When no `languages` are supplied, checks every language the body has been authored in.
 */
export function checkTemplateIssue(
  subject: LocalizedString,
  body: LocalizedString,
  requiredVars: readonly string[],
  languages?: readonly Language[]
): TemplateIssue {
  const targets = languages ?? authoredLanguages(body);
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
