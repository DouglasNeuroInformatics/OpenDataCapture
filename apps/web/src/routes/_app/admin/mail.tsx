import React from 'react';

import { Button, Checkbox, Heading, Input, Select, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $LocalizedString } from '@opendatacapture/schemas/core';
import type { LocalizedString } from '@opendatacapture/schemas/core';
import {
  $MailEncryption,
  $TestMailData,
  $UpdateMailConfigData,
  DEFAULT_NEW_USER_EMAIL_TEMPLATE
} from '@opendatacapture/schemas/mail';
import type { MailConfigDto, MailEncryption, MailTemplate, UpdateMailConfigData } from '@opendatacapture/schemas/mail';
import { createFileRoute } from '@tanstack/react-router';
import { CircleHelpIcon, Loader2Icon } from 'lucide-react';

import { EmailTemplateEditor } from '@/components/EmailTemplateEditor';
import { FormField } from '@/components/FormField';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { useMailErrorMessage } from '@/hooks/useMailErrorMessage';
import { mailSettingsQueryOptions, useMailSettingsQuery } from '@/hooks/useMailSettingsQuery';
import { useTestMailMutation } from '@/hooks/useTestMailMutation';
import { useUpdateMailSettingsMutation } from '@/hooks/useUpdateMailSettingsMutation';
import { checkTemplateIssue } from '@/utils/email-template';

// Shown in the password field when one is already stored. The real value is never sent to the
// client; leaving this mask unchanged keeps the stored secret, editing it sets a new one.
const MASKED_SECRET = '••••••••';

const NEW_USER_VARS = ['firstName', 'lastName', 'username', 'group', 'url'];
const REQUIRED_NEW_USER_VARS = ['username'] as const;

// Standard SMTP submission ports per encryption mode, offered as the placeholder.
const PORT_DEFAULTS = {
  none: '25',
  ssl: '465',
  starttls: '587'
} as const satisfies { [K in ConfigFormValues['encryption']]: string };

type ConfigFormValues = {
  enabled: boolean;
  encryption: MailEncryption;
  host: string;
  password: string;
  port: string;
  senderAddress: string;
  senderName: string;
  username: string;
};

type FieldErrors = { [K in keyof ConfigFormValues]?: string };

const initialValues = (config: MailConfigDto | null): ConfigFormValues => ({
  enabled: config?.enabled ?? false,
  encryption: config?.encryption ?? 'starttls',
  host: config?.host ?? '',
  password: config?.hasPassword ? MASKED_SECRET : '',
  // Empty for a new config so the encryption-specific suggestion shows and must be typed.
  port: config?.port ? String(config.port) : '',
  senderAddress: config?.senderAddress ?? '',
  senderName: config?.senderName ?? '',
  username: config?.username ?? ''
});

const cleanLocalized = (value: LocalizedString): LocalizedString =>
  $LocalizedString.parse(Object.fromEntries(Object.entries(value).filter(([, text]) => text)));

const RouteComponent = () => {
  const { t } = useTranslation();
  const { data: settings } = useMailSettingsQuery();

  return (
    <div className="w-full">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Mail Server', fr: 'Serveur de courriel' })}
        </Heading>
      </PageHeader>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" data-testid="mail-settings-page">
        <MailManager config={settings.config} newUserEmailTemplate={settings.newUserEmailTemplate} />
      </div>
    </div>
  );
};

const MailManager = ({
  config,
  newUserEmailTemplate
}: {
  config: MailConfigDto | null;
  newUserEmailTemplate: MailTemplate;
}) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const updateMutation = useUpdateMailSettingsMutation();

  const [values, setValues] = React.useState<ConfigFormValues>(() => initialValues(config));
  const [errors, setErrors] = React.useState<FieldErrors>({});

  // Per-field copy for the rules `$UpdateMailConfigData` enforces. The schema decides what is
  // invalid; this only decides how to say it, so the two cannot disagree about the rules.
  const errorMessages: { [K in keyof ConfigFormValues]?: string } = {
    host: t({
      en: 'Enter a valid host (e.g. smtp.example.org)',
      fr: 'Entrez un hôte valide (p. ex. smtp.example.org)'
    }),
    password: t({ en: 'A password is required', fr: 'Un mot de passe est requis' }),
    port: t({
      en: 'Port must be a whole number between 1 and 65535',
      fr: 'Le port doit être un nombre entier entre 1 et 65535'
    }),
    senderAddress: t({
      en: 'Enter a valid sender address (e.g. noreply@example.org)',
      fr: "Entrez une adresse d'expéditeur valide (p. ex. noreply@example.org)"
    }),
    username: t({ en: 'A username is required', fr: "Le nom d'utilisateur est requis" })
  };

  /** Validate the live form into an API payload, collecting a message per offending field. */
  const buildConfig = (): { errors: FieldErrors } | { payload: UpdateMailConfigData } => {
    const isSecretChanged = values.password !== '' && values.password !== MASKED_SECRET;
    const host = values.host.trim();
    const port = Number(values.port);
    const username = values.username.trim();
    const parsed = $UpdateMailConfigData.safeParse({
      enabled: values.enabled,
      encryption: values.encryption,
      host,
      port,
      senderAddress: values.senderAddress.trim(),
      senderName: values.senderName.trim() || undefined,
      username,
      // Only send the password when it has actually been changed from the stored (masked) one.
      ...(isSecretChanged ? { password: values.password } : {})
    });
    const nextErrors: FieldErrors = {};
    // The server only lets a blank password inherit the stored one for the same server, so the
    // password has to be re-entered when there is none yet or when the server identity changes.
    // Must match `MailService.requiresNewPassword`, encryption included: downgrading it on the
    // same host would otherwise reuse the stored password over an unencrypted connection.
    const isServerChanged =
      config !== null &&
      (config.host !== host ||
        config.username !== username ||
        config.port !== port ||
        config.encryption !== values.encryption);
    if ((!config?.hasPassword || isServerChanged) && !isSecretChanged) {
      nextErrors.password = isServerChanged
        ? t({
            en: 'Re-enter the password for this mail server',
            fr: 'Saisissez à nouveau le mot de passe pour ce serveur'
          })
        : errorMessages.password;
    }
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ConfigFormValues;
        nextErrors[field] = errorMessages[field] ?? issue.message;
      }
      return { errors: nextErrors };
    }
    if (Object.keys(nextErrors).length > 0) {
      return { errors: nextErrors };
    }
    return { payload: parsed.data };
  };

  const set = <K extends keyof ConfigFormValues>(key: K, value: ConfigFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const save = async (data: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    try {
      const next = await updateMutation.mutateAsync(data);
      // Re-seed from what the server actually stored, so any normalisation is visible and the
      // masked password reflects the saved state rather than whatever was typed.
      setValues(initialValues(next.config));
      addNotification({ type: 'success' });
      return true;
    } catch {
      addNotification({
        message: t({
          en: 'Your changes were not saved. Check your connection and try again.',
          fr: "Vos modifications n'ont pas été enregistrées. Vérifiez votre connexion et réessayez."
        }),
        title: t({ en: 'Save failed', fr: "Échec de l'enregistrement" }),
        type: 'error'
      });
      return false;
    }
  };

  const handleSaveConfig = async () => {
    const result = buildConfig();
    if ('errors' in result) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    await save({ config: result.payload });
  };

  const handleToggleEnabled = async (checked: boolean) => {
    set('enabled', checked);
    // Persist a disable immediately so the rest of the app reflects it. Enabling for the first
    // time only reveals the form — saving a valid configuration is what turns it on.
    if (!checked && config) {
      await save({ config: { ...config, enabled: false, senderName: config.senderName ?? undefined } });
    }
  };

  return (
    <React.Fragment>
      <SectionCard data-testid="mail-enabled-card">
        <Heading className="mb-1" variant="h4">
          {t({ en: 'Email', fr: 'Courriel' })}
        </Heading>
        <p className="text-muted-foreground mb-4 text-sm">
          {t({
            en: 'Turn outgoing email on to configure your mail server and templates. When off, the application behaves as if email is not available.',
            fr: "Activez l'envoi de courriels pour configurer votre serveur de messagerie et vos modèles. Lorsque c'est désactivé, l'application se comporte comme si le courriel n'était pas disponible."
          })}
        </p>
        <label className="flex items-center gap-2" htmlFor="mail-enabled">
          <Checkbox
            checked={values.enabled}
            data-testid="mail-enabled-toggle"
            id="mail-enabled"
            onCheckedChange={(checked) => void handleToggleEnabled(checked === true)}
          />
          <span className="text-sm font-medium">
            {t({ en: 'Enable email sending', fr: "Activer l'envoi de courriels" })}
          </span>
        </label>
      </SectionCard>

      {values.enabled && (
        <React.Fragment>
          <SectionCard data-testid="mail-server-card">
            <Heading className="mb-1" variant="h4">
              {t({ en: 'Mail Server Configuration', fr: 'Configuration du serveur de courriel' })}
            </Heading>
            <p className="text-muted-foreground mb-4 text-sm">
              {t({
                en: 'Outgoing email is sent over an SMTP connection.',
                fr: "L'envoi de courriels se fait via une connexion SMTP."
              })}
            </p>
            {/* new-password on the secret keeps the browser from autofilling the admin's own login */}
            <div className="flex flex-col gap-4">
              <FormField error={errors.host} htmlFor="mail-host" label={t({ en: 'Host', fr: 'Hôte' })}>
                <Input
                  autoComplete="off"
                  data-testid="mail-host"
                  id="mail-host"
                  name="odc-smtp-host"
                  placeholder="smtp.example.org"
                  value={values.host}
                  onChange={(event) => set('host', event.target.value)}
                />
              </FormField>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-medium" htmlFor="mail-encryption">
                    {t({ en: 'Encryption', fr: 'Chiffrement' })}
                  </label>
                  <Tooltip>
                    <Tooltip.Trigger
                      aria-label={t({ en: 'About encryption options', fr: 'À propos des options de chiffrement' })}
                      className="text-muted-foreground h-5 w-5 rounded-full p-0"
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <CircleHelpIcon className="h-4 w-4" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="flex max-w-xs flex-col gap-2 text-xs leading-relaxed">
                      <span>
                        {t({
                          en: 'STARTTLS (default port 587) is the modern default and recommended for most setups — it upgrades a plain connection to an encrypted one and has the best compatibility.',
                          fr: 'STARTTLS (port par défaut 587) est la valeur par défaut moderne et recommandée — elle convertit une connexion en clair en connexion chiffrée et offre la meilleure compatibilité.'
                        })}
                      </span>
                      <span>
                        {t({
                          en: 'SSL/TLS (default port 465) is encrypted from the start, used by some providers and legacy systems. If unsure, choose STARTTLS.',
                          fr: 'SSL/TLS (port par défaut 465) est chiffré dès le départ, utilisé par certains fournisseurs et systèmes hérités. En cas de doute, choisissez STARTTLS.'
                        })}
                      </span>
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <Select
                  value={values.encryption}
                  onValueChange={(value) => set('encryption', $MailEncryption.parse(value))}
                >
                  <Select.Trigger className="w-full" data-testid="mail-encryption" id="mail-encryption">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="starttls">STARTTLS</Select.Item>
                    <Select.Item value="ssl">SSL/TLS</Select.Item>
                    <Select.Item value="none">{t({ en: 'None', fr: 'Aucun' })}</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <FormField
                description={t(
                  {
                    en: 'Suggested port for {}: {}',
                    fr: 'Port suggéré pour {} : {}'
                  },
                  { args: [values.encryption.toUpperCase(), PORT_DEFAULTS[values.encryption]] }
                )}
                error={errors.port}
                htmlFor="mail-port"
                label={t({ en: 'Port', fr: 'Port' })}
              >
                <Input
                  autoComplete="off"
                  data-testid="mail-port"
                  id="mail-port"
                  name="odc-smtp-port"
                  placeholder={PORT_DEFAULTS[values.encryption]}
                  type="number"
                  value={values.port}
                  onChange={(event) => set('port', event.target.value)}
                />
              </FormField>

              <FormField
                error={errors.username}
                htmlFor="mail-username"
                label={t({ en: 'Username', fr: "Nom d'utilisateur" })}
              >
                <Input
                  autoComplete="off"
                  data-testid="mail-username"
                  id="mail-username"
                  name="odc-smtp-username"
                  value={values.username}
                  onChange={(event) => set('username', event.target.value)}
                />
              </FormField>

              <FormField
                description={
                  config?.hasPassword
                    ? t({
                        en: 'A password is set (shown masked). Edit the field to replace it.',
                        fr: 'Un mot de passe est défini (affiché masqué). Modifiez le champ pour le remplacer.'
                      })
                    : undefined
                }
                error={errors.password}
                htmlFor="mail-password"
                label={t({ en: 'Password', fr: 'Mot de passe' })}
              >
                <Input
                  data-1p-ignore
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-testid="mail-password"
                  id="mail-password"
                  name="odc-smtp-secret"
                  type="password"
                  value={values.password}
                  onChange={(event) => set('password', event.target.value)}
                />
              </FormField>

              <FormField htmlFor="mail-sender-name" label={t({ en: 'Sender name', fr: "Nom de l'expéditeur" })}>
                <Input
                  autoComplete="off"
                  data-testid="mail-sender-name"
                  id="mail-sender-name"
                  name="odc-smtp-sender-name"
                  value={values.senderName}
                  onChange={(event) => set('senderName', event.target.value)}
                />
              </FormField>

              <FormField
                error={errors.senderAddress}
                htmlFor="mail-sender-address"
                label={t({ en: 'Sender address', fr: "Adresse de l'expéditeur" })}
              >
                <Input
                  autoComplete="off"
                  data-testid="mail-sender-address"
                  id="mail-sender-address"
                  name="odc-smtp-sender-address"
                  placeholder="noreply@example.org"
                  value={values.senderAddress}
                  onChange={(event) => set('senderAddress', event.target.value)}
                />
              </FormField>

              <div>
                <Button
                  data-testid="mail-save-config"
                  disabled={updateMutation.isPending}
                  type="button"
                  variant="primary"
                  onClick={() => void handleSaveConfig()}
                >
                  {updateMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  {t('core.save')}
                </Button>
              </div>
            </div>
          </SectionCard>

          <TestMailSection buildConfig={buildConfig} onInvalid={setErrors} />

          <NewUserTemplateSection
            isSaving={updateMutation.isPending}
            template={newUserEmailTemplate}
            onSave={(next) => save({ newUserEmailTemplate: next })}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const TestMailSection = ({
  buildConfig,
  onInvalid
}: {
  buildConfig: () => { errors: FieldErrors } | { payload: UpdateMailConfigData };
  onInvalid: (errors: FieldErrors) => void;
}) => {
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

const NewUserTemplateSection = ({
  isSaving,
  onSave,
  template: saved
}: {
  isSaving: boolean;
  onSave: (template: MailTemplate) => Promise<boolean>;
  template: MailTemplate;
}) => {
  const { t } = useTranslation();
  const [template, setTemplate] = React.useState<MailTemplate>(() => ({
    body: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.body, ...saved.body },
    subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject, ...saved.subject }
  }));

  const issue = checkTemplateIssue(template.subject, template.body, REQUIRED_NEW_USER_VARS);
  const error =
    issue === 'incomplete'
      ? t({
          en: 'Fill in the subject and body for each language.',
          fr: "Remplissez l'objet et le corps pour chaque langue."
        })
      : issue === 'missing-vars'
        ? t({ en: 'The body must include {{username}}.', fr: 'Le corps doit inclure {{username}}.' })
        : undefined;

  return (
    <SectionCard data-testid="mail-template-card">
      <div className="mb-1 flex items-start justify-between gap-4">
        <Heading variant="h4">
          {t({ en: 'New User Email Template', fr: 'Modèle de courriel pour les nouveaux utilisateurs' })}
        </Heading>
        <Button
          className="shrink-0"
          data-testid="mail-template-reset"
          size="sm"
          type="button"
          variant="outline"
          onClick={() =>
            setTemplate({
              body: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.body },
              subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject }
            })
          }
        >
          {t({ en: 'Reset', fr: 'Réinitialiser' })}
        </Button>
      </div>
      <p className="text-muted-foreground mb-4 text-sm">
        {t({
          en: 'Sent automatically when a new user with an email address is created. The sender chooses the language.',
          fr: "Envoyé automatiquement lors de la création d'un nouvel utilisateur disposant d'une adresse courriel. L'expéditeur choisit la langue."
        })}
      </p>
      <EmailTemplateEditor
        error={error}
        idPrefix="new-user-template"
        template={template}
        variables={NEW_USER_VARS}
        onChange={setTemplate}
      />
      <div className="mt-4">
        <Button
          data-testid="mail-template-save"
          disabled={isSaving || Boolean(error)}
          type="button"
          variant="primary"
          onClick={() =>
            void onSave({ body: cleanLocalized(template.body), subject: cleanLocalized(template.subject) })
          }
        >
          {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          {t('core.save')}
        </Button>
      </div>
    </SectionCard>
  );
};

export const Route = createFileRoute('/_app/admin/mail')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(mailSettingsQueryOptions())
});
