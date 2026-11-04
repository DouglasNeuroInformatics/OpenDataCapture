import { useEffect, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

/** Long enough to read the completion screen, short enough not to be mistaken for a dead end. */
const REDIRECT_DELAY_SECONDS = 5;

type CompletionRedirectProps = {
  url: string;
};

/**
 * Sends the subject on to `url` after a short countdown. `replace` rather than `assign`, so going
 * back does not return to the completed assignment, which the gateway no longer serves.
 */
const CompletionRedirect = ({ url }: CompletionRedirectProps) => {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0) {
      window.location.replace(url);
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timeout);
  }, [secondsLeft, url]);

  return (
    <p className="text-muted-foreground pb-8 text-center text-sm" data-testid="completion-redirect">
      {t({
        en: `Redirecting in ${secondsLeft}…`,
        es: `Redirigiendo en ${secondsLeft}…`,
        fr: `Redirection dans ${secondsLeft}…`
      })}{' '}
      <a
        className="text-primary font-medium underline underline-offset-4"
        data-testid="completion-redirect-link"
        href={url}
        onClick={(event) => {
          event.preventDefault();
          window.location.replace(url);
        }}
      >
        {t({ en: 'Continue now', es: 'Continuar ahora', fr: 'Continuer maintenant' })}
      </a>
    </p>
  );
};

export default CompletionRedirect;
