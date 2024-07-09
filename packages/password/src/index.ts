import type { Language } from '@opendatacapture/schemas/core';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import type { FeedbackType } from '@zxcvbn-ts/core';
import { adjacencyGraphs, dictionary } from '@zxcvbn-ts/language-common';
import { translations as enTranslations } from '@zxcvbn-ts/language-en';
import { translations as frTranslations } from '@zxcvbn-ts/language-fr';

zxcvbnOptions.setOptions({ dictionary, graphs: adjacencyGraphs });

type FeedbackTranslations = {
  suggestions: { [key: string]: string };
  warnings: { [key: string]: string };
};

type PasswordStrengthOptions = {
  feedbackLanguage?: Language;
};

type PasswordStrengthResult = {
  feedback: FeedbackType;
  success: boolean;
};

function translateFeedback(feedback: FeedbackType, language: Language): FeedbackType {
  const translations: FeedbackTranslations = language === 'fr' ? frTranslations : enTranslations;
  return {
    suggestions: feedback.suggestions.map((suggestion) => translations.suggestions[suggestion]),
    warning: feedback.warning ? translations.warnings[feedback.warning] : null
  };
}

export function estimatePasswordStrength(password: string, options?: PasswordStrengthOptions): PasswordStrengthResult {
  const result = zxcvbn(password);
  return {
    feedback: translateFeedback(result.feedback, options?.feedbackLanguage ?? 'en'),
    success: result.score > 2
  };
}

// eslint-disable-next-line no-console
console.log(estimatePasswordStrength('password'));
