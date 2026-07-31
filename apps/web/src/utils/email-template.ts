import type { LocalizedString } from '@opendatacapture/schemas/core';

/** Whether a body string contains a given `{{variable}}` placeholder. */
function hasVar(body: string, name: string): boolean {
  return new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`).test(body);
}

export type TemplateIssue = 'incomplete' | 'missing-vars' | null;

/**
 * What (if anything) is wrong with a template for the given languages:
 * `incomplete` when a required language's subject/body is blank,
 * `missing-vars` when the body omits a required variable, otherwise `null`.
 * When no `languages` are supplied, checks all languages present in the template.
 */
export function checkTemplateIssue(
  subject: LocalizedString,
  body: LocalizedString,
  requiredVars: readonly string[],
  languages?: readonly string[]
): TemplateIssue {
  const langs = languages ?? Object.keys(body).filter((k) => body[k as keyof LocalizedString]);
  if (langs.length === 0) {
    return 'incomplete';
  }
  for (const lang of langs) {
    const s = subject[lang as keyof LocalizedString];
    const b = body[lang as keyof LocalizedString];
    if (!s?.trim() || !b?.trim()) {
      return 'incomplete';
    }
    if (requiredVars.length > 0 && requiredVars.some((name) => !hasVar(b, name))) {
      return 'missing-vars';
    }
  }
  return null;
}
