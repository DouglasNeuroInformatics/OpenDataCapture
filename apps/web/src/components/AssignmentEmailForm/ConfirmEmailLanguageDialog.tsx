import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';

import { LANGUAGE_LABELS } from '@/utils/language';

export type ConfirmEmailLanguageDialogProps = {
  /** The language the email will be written in. */
  emailLanguage: Language;
  isPending: boolean;
  /** The language the assignment link opens the instrument in. */
  linkLanguage: Language;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

/**
 * Asks before sending an email written in one language for a link that opens in another. The two
 * are set separately and nothing else in the app shows them side by side, so the mismatch is easy
 * to create and invisible until the subject opens the link.
 *
 * Rendered only while confirming, so it needs no closed state of its own.
 */
export const ConfirmEmailLanguageDialog = ({
  emailLanguage,
  isPending,
  linkLanguage,
  onConfirm,
  onOpenChange
}: ConfirmEmailLanguageDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md" data-testid="confirm-email-language-dialog">
        <Dialog.Header>
          <Dialog.Title>
            {t({ en: 'Languages do not match', es: 'Los idiomas no coinciden', fr: 'Langues différentes' })}
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
          {t(
            {
              en: 'This email will be written in {}, but the link opens the instrument in {}. Send it anyway?',
              es: 'Este correo se escribirá en {}, pero el enlace abre el instrumento en {}. ¿Enviarlo de todos modos?',
              fr: "Ce courriel sera rédigé en {}, mais le lien ouvre l'instrument en {}. L'envoyer quand même ?"
            },
            { args: [t(LANGUAGE_LABELS[emailLanguage]), t(LANGUAGE_LABELS[linkLanguage])] }
          )}
        </Dialog.Description>
        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('core.cancel')}
          </Button>
          <Button data-testid="confirm-email-language" disabled={isPending} type="button" onClick={onConfirm}>
            {t({ en: 'Send anyway', es: 'Enviar de todos modos', fr: 'Envoyer quand même' })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
