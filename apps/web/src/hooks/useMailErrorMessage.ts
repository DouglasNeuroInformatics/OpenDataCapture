import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { MailErrorCode } from '@opendatacapture/schemas/mail';

/**
 * Render a {@link MailErrorCode} in the reader's language. The API returns a code rather than a
 * sentence precisely because it cannot know who is reading the result, so the copy lives here.
 */
export function useMailErrorMessage(): (code: MailErrorCode | null | undefined) => string {
  const { t } = useTranslation();
  const messages: { [K in MailErrorCode]: string } = {
    AUTHENTICATION_FAILED: t({
      en: 'Authentication failed — check the username and password.',
      es: 'Falló la autenticación: compruebe el nombre de usuario y la contraseña.',
      fr: "L'authentification a échoué — vérifiez le nom d'utilisateur et le mot de passe."
    }),
    CONNECTION_REFUSED: t({
      en: 'The mail server refused the connection — check the host and port.',
      es: 'El servidor de correo rechazó la conexión: compruebe el servidor y el puerto.',
      fr: 'Le serveur de courriel a refusé la connexion — vérifiez l’hôte et le port.'
    }),
    HOST_NOT_FOUND: t({
      en: 'The mail server could not be found — check the host name.',
      es: 'No se encontró el servidor de correo: compruebe el nombre del servidor.',
      fr: 'Le serveur de courriel est introuvable — vérifiez le nom d’hôte.'
    }),
    INSECURE_CONNECTION: t({
      en: 'Could not establish a secure connection — check the port and encryption method.',
      es: 'No se pudo establecer una conexión segura: compruebe el puerto y el método de cifrado.',
      fr: 'Impossible d’établir une connexion sécurisée — vérifiez le port et le chiffrement.'
    }),
    PASSWORD_REQUIRED: t({
      en: 'The mail server has changed — enter the password again to confirm it.',
      es: 'El servidor de correo ha cambiado: introduzca de nuevo la contraseña para confirmarla.',
      fr: 'Le serveur de courriel a changé — saisissez de nouveau le mot de passe pour le confirmer.'
    }),
    SENDER_REJECTED: t({
      en: 'The sender address was rejected — check the sender address.',
      es: 'Se rechazó la dirección del remitente: compruebe la dirección del remitente.',
      fr: "L'adresse d'expéditeur a été refusée — vérifiez l'adresse d'expéditeur."
    }),
    UNKNOWN: t({
      en: 'Please check and reconfigure your mail settings and try again.',
      es: 'Revise y vuelva a configurar los ajustes de correo e inténtelo de nuevo.',
      fr: 'Veuillez vérifier et reconfigurer vos paramètres de courriel, puis réessayer.'
    })
  };
  return (code) => messages[code ?? 'UNKNOWN'];
}
