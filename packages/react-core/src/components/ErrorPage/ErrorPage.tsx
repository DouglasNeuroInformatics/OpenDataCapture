import { useEffect } from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { isAxiosError } from 'axios';
import { getReasonPhrase } from 'http-status-codes';
import { serializeError } from 'serialize-error';

export type ErrorPageProps = {
  error: unknown;
};

export const ErrorPage = ({ error }: ErrorPageProps) => {
  const download = useDownload();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  let heading = t({ en: 'Unknown Error', fr: 'Erreur inconnue' });
  if (isAxiosError(error) && error.status) {
    heading = `${error.status} - ${getReasonPhrase(error.status)}`;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-1 p-3 text-center">
      <h1 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
        {t({ en: 'Something Went Wrong', fr: "Une erreur s'est produite" })}
      </h1>
      <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{heading}</h3>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm sm:text-base">
        {t({
          en: 'We apologize for the inconvenience. Please download the error report using the button below and send it to your platform administrator for further assistance.',
          fr: "Nous nous excusons pour ce désagrément. Veuillez télécharger le rapport d'erreur à l'aide du bouton ci-dessous et l'envoyer à l'administrateur de votre plateforme pour obtenir de l'aide."
        })}
      </p>
      <div className="mt-6 flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void download('error.json', JSON.stringify(serializeError(error), null, 2));
          }}
        >
          {t({ en: 'Error Report', fr: "Rapport d'erreur" })}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            window.location.assign(window.location.origin);
          }}
        >
          {t({ en: 'Reload Page', fr: 'Recharger la page' })}
        </Button>
      </div>
    </div>
  );
};
