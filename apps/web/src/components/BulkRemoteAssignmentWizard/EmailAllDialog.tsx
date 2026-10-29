import { useState } from 'react';

import { Button, Dialog, Label, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { LanguageSelect } from '@/components/LanguageSelect';
import type { BulkAssignmentEmail } from '@/hooks/useBulkAssignmentEmail';

type EmailAllDialogProps = {
  /**
   * The send controller, passed whole rather than spread into a dozen props: every field of it is
   * read here, and the table that renders the per-row outcomes shares the same instance.
   */
  bulkEmail: BulkAssignmentEmail;
};

export const EmailAllDialog = ({ bulkEmail }: EmailAllDialogProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // What a send would write to now: everyone on a fresh batch, only the failures after a send.
  const pendingCount = bulkEmail.pending.length;
  const isRetry = pendingCount > 0 && bulkEmail.hasAttempted;

  const send = async () => {
    setIsOpen(false);
    await bulkEmail.sendAll();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button
          data-testid="bulk-email-all"
          disabled={pendingCount === 0 || bulkEmail.isSending || bulkEmail.isLoading}
          type="button"
          variant="primary"
        >
          {bulkEmail.isSending
            ? t(
                {
                  en: 'Sending… ({}/{})',
                  es: 'Enviando… ({}/{})',
                  fr: 'Envoi en cours… ({}/{})'
                },
                { args: [String(bulkEmail.completedCount), String(pendingCount)] }
              )
            : isRetry
              ? t(
                  {
                    en: 'Retry Failed ({})',
                    es: 'Reintentar los fallidos ({})',
                    fr: 'Réessayer les échecs ({})'
                  },
                  { args: [String(pendingCount)] }
                )
              : t(
                  {
                    en: 'Email All ({})',
                    es: 'Enviar todos ({})',
                    fr: 'Tout envoyer ({})'
                  },
                  { args: [String(pendingCount)] }
                )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Email All', es: 'Enviar todos', fr: 'Tout envoyer' })}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
          {isRetry
            ? t(
                {
                  en: 'Send again to the {} subjects whose email did not go out. Nobody who already received their links is written to twice.',
                  es: 'Volver a enviar a los {} sujetos cuyo correo no salió. Nadie que ya haya recibido sus enlaces recibe un segundo correo.',
                  fr: "Renvoyer aux {} sujets dont le courriel n'est pas parti. Personne ayant déjà reçu ses liens n'est écrit une deuxième fois."
                },
                { args: [String(pendingCount)] }
              )
            : t(
                {
                  en: 'Send one email to each of {} subjects, listing every link assigned to them. A subject who receives their links is not written to again.',
                  es: 'Enviar un correo a cada uno de {} sujetos, con todos los enlaces asignados. Un sujeto que reciba sus enlaces no recibe otro correo.',
                  fr: "Envoyer un courriel à chacun des {} sujets, avec tous les liens qui leur sont attribués. Un sujet qui reçoit ses liens n'est pas réécrit."
                },
                { args: [String(pendingCount)] }
              )}
        </Dialog.Description>
        <Dialog.Body className="flex flex-col gap-4">
          {bulkEmail.templates.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bulk-email-template">
                {t({ en: 'Email template', es: 'Plantilla de correo', fr: 'Modèle de courriel' })}
              </Label>
              <Select value={bulkEmail.selectedTemplate} onValueChange={bulkEmail.setTemplateChoice}>
                <Select.Trigger data-testid="bulk-email-template" id="bulk-email-template">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {bulkEmail.templateOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bulk-email-language">
              {t({ en: 'Email language', es: 'Idioma del correo', fr: 'Langue du courriel' })}
            </Label>
            <LanguageSelect
              data-testid="bulk-email-language"
              id="bulk-email-language"
              options={bulkEmail.templateLanguages}
              value={bulkEmail.language}
              onChange={bulkEmail.setLanguageChoice}
            />
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button data-testid="bulk-email-cancel" type="button" variant="outline" onClick={() => setIsOpen(false)}>
            {t('core.cancel')}
          </Button>
          <Button data-testid="bulk-email-confirm" type="button" variant="primary" onClick={() => void send()}>
            {t({ en: 'Email', es: 'Enviar', fr: 'Envoyer' })}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
