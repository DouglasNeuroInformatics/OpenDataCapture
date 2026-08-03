import React from 'react';

import { Button, Heading, Input } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $TestMailData } from '@opendatacapture/schemas/mail';
import type { UpdateMailConfigData } from '@opendatacapture/schemas/mail';
import { Loader2Icon } from 'lucide-react';

import { SectionCard } from '@/components/SectionCard';
import { useMailErrorMessage } from '@/hooks/useMailErrorMessage';
import { useTestMailMutation } from '@/hooks/useTestMailMutation';

import type { MailConfigFieldErrors } from './MailServerForm';

export type TestMailSectionProps = {
  /** Validates the live form; the test runs against unsaved values, so it cannot use the query. */
  buildConfig: () => { errors: MailConfigFieldErrors } | { payload: UpdateMailConfigData };
  onInvalid: (errors: MailConfigFieldErrors) => void;
};

export const TestMailSection = ({ buildConfig, onInvalid }: TestMailSectionProps) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const testMutation = useTestMailMutation();
  const mailErrorMessage = useMailErrorMessage();
  const [recipient, setRecipient] = React.useState('');
  const [testingMode, setTestingMode] = React.useState<'connection' | 'email' | null>(null);

  const isValidRecipient = $TestMailData.shape.recipient.safeParse(recipient).success && recipient.length > 0;

  const runTest = (withRecipient: boolean) => {
    const result = buildConfig();
    if ('errors' in result) {
      onInvalid(result.errors);
      return;
    }
    setTestingMode(withRecipient ? 'email' : 'connection');
    testMutation.mutate(
      { config: result.payload, recipient: withRecipient ? recipient : undefined },
      {
        onError: () => {
          addNotification({
            message: t({
              en: 'The test could not be completed (the server may be unreachable or the request timed out). Check the host, port, and credentials.',
              fr: "Le test n'a pas pu être effectué (serveur injoignable ou délai dépassé). Vérifiez l'hôte, le port et les identifiants."
            }),
            title: t({ en: 'Mail test failed', fr: 'Échec du test de courriel' }),
            type: 'error'
          });
        },
        onSettled: () => setTestingMode(null),
        onSuccess: (outcome) => {
          if (!outcome.success) {
            addNotification({
              message: mailErrorMessage(outcome.error),
              title: t({ en: 'Mail test failed', fr: 'Échec du test de courriel' }),
              type: 'error'
            });
            return;
          }
          addNotification({
            message: withRecipient
              ? t({ en: 'Test email sent to {}', fr: 'Courriel de test envoyé à {}' }, { args: [recipient] })
              : t({
                  en: 'Connected to the mail server successfully',
                  fr: 'Connexion au serveur de courriel réussie'
                }),
            title: t({ en: 'Mail test succeeded', fr: 'Test de courriel réussi' }),
            type: 'success'
          });
        }
      }
    );
  };

  return (
    <SectionCard data-testid="mail-test-card">
      <Heading className="mb-5" variant="h4">
        {t({ en: 'Verify Your Configuration', fr: 'Vérifiez votre configuration' })}
      </Heading>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-start gap-2">
          <div>
            <p className="text-sm font-medium">{t({ en: 'Connection', fr: 'Connexion' })}</p>
            <p className="text-muted-foreground text-xs">
              {t({
                en: 'Check that the server accepts the connection and your credentials.',
                fr: 'Vérifiez que le serveur accepte la connexion et vos identifiants.'
              })}
            </p>
          </div>
          <Button
            data-testid="mail-test-connection"
            disabled={testMutation.isPending}
            type="button"
            variant="primary"
            onClick={() => runTest(false)}
          >
            {testingMode === 'connection' && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {testingMode === 'connection'
              ? t({ en: 'Testing…', fr: 'Test en cours…' })
              : t({ en: 'Test connection', fr: 'Tester la connexion' })}
          </Button>
        </div>

        <div className="border-border border-t" />

        <div className="flex flex-col items-start gap-2">
          <div>
            <p className="text-sm font-medium">{t({ en: 'Send test email', fr: 'Envoyer un courriel de test' })}</p>
            <p className="text-muted-foreground text-xs">
              {t({
                en: 'Deliver a real message to confirm everything works end to end.',
                fr: 'Envoyez un message réel pour confirmer que tout fonctionne de bout en bout.'
              })}
            </p>
          </div>
          <Input
            autoComplete="off"
            className="sm:max-w-sm"
            data-testid="mail-test-recipient"
            id="mail-test-recipient"
            name="odc-smtp-test-recipient"
            placeholder={t({ en: 'recipient@example.org', fr: 'destinataire@exemple.org' })}
            type="email"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
          />
          <Button
            data-testid="mail-send-test"
            disabled={testMutation.isPending || !isValidRecipient}
            type="button"
            variant="primary"
            onClick={() => runTest(true)}
          >
            {testingMode === 'email' && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {testingMode === 'email'
              ? t({ en: 'Sending…', fr: 'Envoi en cours…' })
              : t({ en: 'Send test email', fr: 'Envoyer un courriel de test' })}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};
