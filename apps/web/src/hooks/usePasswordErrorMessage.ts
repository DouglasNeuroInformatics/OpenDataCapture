import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { PASSWORD_ERROR_CODES } from '@opendatacapture/schemas/user';
import type { PasswordErrorCode } from '@opendatacapture/schemas/user';
import { isAxiosError } from 'axios';

function parsePasswordErrorCode(data: unknown): null | PasswordErrorCode {
  if (typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string') {
    return (PASSWORD_ERROR_CODES as readonly string[]).includes(data.code) ? (data.code as PasswordErrorCode) : null;
  }
  return null;
}

/**
 * Render whatever a rejected password write failed on in the reader's language, falling back to
 * `fallback` for anything that is not a password-policy rejection. The API answers with a
 * {@link PasswordErrorCode} rather than a sentence because it cannot know who is reading it, so
 * every caller that sets a password shares this one mapping instead of restating the rules.
 */
export function usePasswordErrorMessage(): (err: unknown, fallback: string) => string {
  const { t } = useTranslation();
  const messages: { [K in PasswordErrorCode]: string } = {
    INSUFFICIENT_PASSWORD_STRENGTH: t('common.insufficientPasswordStrength'),
    PASSWORD_IN_DATA_BREACH: t('common.passwordInDataBreach'),
    PASSWORD_MATCHES_CURRENT: t('common.passwordMatchesCurrent'),
    PASSWORD_MATCHES_USERNAME: t('common.passwordMatchesUsername')
  };
  return (err, fallback) => {
    if (!isAxiosError(err) || err.response?.status !== 400) {
      return fallback;
    }
    const code = parsePasswordErrorCode(err.response.data);
    return code ? messages[code] : fallback;
  };
}
