import { useEffect, useState } from 'react';

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
  const [copyState, setCopyState] = useState<'COPIED' | 'FAILED' | 'READY'>('READY');

  useEffect(() => {
    console.error(error);
  }, [error]);

  const report = JSON.stringify(serializeError(error), null, 2);

  // `navigator.clipboard` is absent outside a secure context, so an instance served over plain http
  // has no clipboard at all. Say so rather than appearing to copy nothing — the report is the only
  // thing the administrator has to go on, and the download beside this button is the way out.
  const copyReport = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('The clipboard is unavailable outside a secure context');
      }
      await navigator.clipboard.writeText(report);
      setCopyState('COPIED');
    } catch (err) {
      console.error(err);
      setCopyState('FAILED');
    }
  };

  let heading = t({ en: 'Unknown Error', es: 'Error desconocido', fr: 'Erreur inconnue' });
  if (isAxiosError(error) && error.status) {
    heading = `${error.status} - ${getReasonPhrase(error.status)}`;
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-1 p-3 text-center"
      data-testid="error-page"
    >
      <h1 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        {t({ en: 'Something Went Wrong', es: 'Algo salió mal', fr: "Une erreur s'est produite" })}
      </h1>
      <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{heading}</h3>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm sm:text-base">
        {t({
          en: 'We apologize for the inconvenience. Please copy or download the error report using the buttons below and send it to your platform administrator for further assistance.',
          es: 'Nos disculpamos por las molestias. Copie o descargue el informe de error con los botones de abajo y envíelo al administrador de su plataforma para obtener ayuda.',
          fr: "Nous nous excusons pour ce désagrément. Veuillez copier ou télécharger le rapport d'erreur à l'aide des boutons ci-dessous et l'envoyer à l'administrateur de votre plateforme pour obtenir de l'aide."
        })}
      </p>
      <div className="mt-6 flex gap-2">
        <Button
          data-testid="copy-error-report"
          type="button"
          variant="outline"
          onClick={() => {
            void copyReport();
          }}
          onMouseLeave={() => {
            setCopyState('READY');
          }}
        >
          {copyState === 'COPIED' && t({ en: 'Copied', es: 'Copiado', fr: 'Copié' })}
          {copyState === 'FAILED' && t({ en: 'Copy Failed', es: 'Error al copiar', fr: 'Échec de la copie' })}
          {copyState === 'READY' &&
            t({ en: 'Copy Error Report', es: 'Copiar el informe de error', fr: "Copier le rapport d'erreur" })}
        </Button>
        <Button
          data-testid="download-error-report"
          type="button"
          variant="outline"
          onClick={() => {
            void download('error.json', report);
          }}
        >
          {t({
            en: 'Download Error Report',
            es: 'Descargar el informe de error',
            fr: "Télécharger le rapport d'erreur"
          })}
        </Button>
        <Button
          data-testid="reload-page"
          type="button"
          variant="primary"
          onClick={() => {
            window.location.assign(window.location.origin);
          }}
        >
          {t({ en: 'Reload Page', es: 'Volver a cargar la página', fr: 'Recharger la page' })}
        </Button>
      </div>
    </div>
  );
};
