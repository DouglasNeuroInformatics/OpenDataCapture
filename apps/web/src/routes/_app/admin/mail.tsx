/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import {
  Button,
  Checkbox,
  Heading,
  Input,
  Label,
  Select,
  TextArea,
  Tooltip
} from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import {
  $LocalizedString,
  $MailEncryption,
  $MailLanguage,
  $MailProvider,
  $MailRegion,
  $UpdateMailConfigData,
  checkTemplateIssue,
  DEFAULT_NEW_USER_EMAIL_TEMPLATE,
  MAIL_LANGUAGE
} from '@opendatacapture/schemas/mail';
import type {
  LocalizedString,
  MailConfigDto,
  MailLanguage,
  MailProvider,
  MailTemplate,
  MailTransport,
  UpdateMailConfigData
} from '@opendatacapture/schemas/mail';
import { createFileRoute } from '@tanstack/react-router';
import { CircleHelpIcon, Loader2Icon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { SaveStatus } from '@/components/SaveStatus';
import { SegmentedControl } from '@/components/SegmentedControl';
import { mailSettingsQueryOptions, useMailSettingsQuery } from '@/hooks/useMailSettingsQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useTestMailMutation } from '@/hooks/useTestMailMutation';
import { useUpdateMailSettingsMutation } from '@/hooks/useUpdateMailSettingsMutation';
import { ALL_LANGUAGES } from '@/utils/languages';

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/90">
    {children}
  </div>
);

const Field = ({
  children,
  description,
  htmlFor,
  label
}: {
  children: React.ReactNode;
  description?: string;
  htmlFor: string;
  label: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {description && <p className="text-muted-foreground text-xs">{description}</p>}
    {children}
  </div>
);

type ConfigFormValues = {
  apiKey: string;
  awsAccessKeyId: string;
  awsRegion: string;
  domain: string;
  enabled: boolean;
  encryption: 'none' | 'ssl' | 'starttls';
  host: string;
  password: string;
  port: string;
  provider: MailProvider;
  region: 'eu' | 'us';
  senderAddress: string;
  senderName: string;
  transport: MailTransport;
  username: string;
};

// Shown in a secret field when one is already stored. The real value is never sent to
// the client; leaving this mask unchanged keeps the stored secret, editing it sets a new one.
const MASKED_SECRET = '••••••••';

// Variables a new-user welcome email can contain; username/password are required so the
// recipient always receives their credentials.
const NEW_USER_VARS = ['firstName', 'lastName', 'username', 'password', 'group', 'url'];
const REQUIRED_NEW_USER_VARS = ['username', 'password'] as const;

const newUserTemplateIssue = (subject: LocalizedString, body: LocalizedString, languages?: string[]) =>
  checkTemplateIssue(subject, body, REQUIRED_NEW_USER_VARS, languages);

// Standard SMTP submission ports per encryption mode, applied as the default when the
// encryption is changed (unless the user has typed a non-standard port).
const PORT_DEFAULTS: { [K in ConfigFormValues['encryption']]: string } = {
  none: '25',
  ssl: '465',
  starttls: '587'
};

const initialValues = (config: MailConfigDto | null): ConfigFormValues => ({
  enabled: config?.enabled ?? false,
  transport: config?.transport ?? 'smtp',
  provider: config?.provider ?? 'mailgun',
  domain: config?.domain ?? '',
  region: config?.region ?? 'us',
  awsRegion: config?.awsRegion ?? '',
  awsAccessKeyId: config?.awsAccessKeyId ?? '',
  host: config?.host ?? '',
  // Empty for a new config so the encryption-specific suggestion shows and must be typed.
  port: config?.port ? String(config.port) : '',
  encryption: config?.encryption ?? 'starttls',
  username: config?.username ?? '',
  password: config?.hasPassword ? MASKED_SECRET : '',
  apiKey: config?.hasApiKey ? MASKED_SECRET : '',
  senderName: config?.senderName ?? '',
  senderAddress: config?.senderAddress ?? ''
});

// Build a (secret-free) update payload from the saved config so the enabled flag can be
// persisted on its own; omitted secrets are kept server-side.
const toEnabledPayload = (config: MailConfigDto, enabled: boolean): UpdateMailConfigData => ({
  awsAccessKeyId: config.awsAccessKeyId,
  awsRegion: config.awsRegion,
  domain: config.domain,
  enabled,
  encryption: config.encryption,
  host: config.host,
  port: config.port,
  provider: config.provider,
  region: config.region,
  senderAddress: config.senderAddress,
  senderName: config.senderName ?? undefined,
  transport: config.transport,
  username: config.username
});

// Debounced autosave: when `snapshot` changes, run `onSave` after a quiet period.
function useAutosave(snapshot: string, onSave: () => void, delay = 1200) {
  const lastSaved = React.useRef(snapshot);
  const onSaveRef = React.useRef(onSave);
  onSaveRef.current = onSave;
  React.useEffect(() => {
    if (snapshot === lastSaved.current) {
      return;
    }
    const timer = setTimeout(() => {
      lastSaved.current = snapshot;
      onSaveRef.current();
    }, delay);
    return () => clearTimeout(timer);
  }, [snapshot, delay]);
}

const MailManager = ({
  activeLanguages,
  config,
  newUserEmailTemplate
}: {
  activeLanguages: string[];
  config: MailConfigDto | null;
  newUserEmailTemplate: MailTemplate;
}) => {
  const { resolvedLanguage, t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const updateMutation = useUpdateMailSettingsMutation();
  const testMutation = useTestMailMutation();

  const [values, setValues] = React.useState<ConfigFormValues>(() => initialValues(config));
  const [template, setTemplate] = React.useState({
    body: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.body, ...newUserEmailTemplate.body },
    subject: { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject, ...newUserEmailTemplate.subject }
  });
  const [templateLang, setTemplateLang] = React.useState<MailLanguage>(() =>
    $MailLanguage.parse(activeLanguages.includes(resolvedLanguage) ? resolvedLanguage : (activeLanguages[0] ?? 'en'))
  );
  const bodyCursorRef = React.useRef<null | { end: number; start: number }>(null);
  const [recipient, setRecipient] = React.useState('');
  const [testingMode, setTestingMode] = React.useState<'connection' | 'email' | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const set = <K extends keyof ConfigFormValues>(key: K, value: ConfigFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  // Validate the live form into an API payload, or return null. When `silent` (autosave),
  // invalid input simply yields null without a notification.
  const buildConfig = (silent = false): null | UpdateMailConfigData => {
    const fail = (message: string) => {
      if (!silent) {
        addNotification({
          message,
          title: t({ en: 'Invalid configuration', es: 'Configuración inválida', fr: 'Configuration invalide' }),
          type: 'error'
        });
      }
      return null;
    };

    const isHttp = values.transport === 'http';
    const host = values.host.trim();
    const username = values.username.trim();
    const domain = values.domain.trim();
    const awsRegion = values.awsRegion.trim();
    const awsAccessKeyId = values.awsAccessKeyId.trim();
    const senderAddress = values.senderAddress.trim();
    const port = Number(values.port);

    if (isHttp) {
      // Mailgun sends through a per-domain endpoint, so a sending domain is required for it.
      if (values.provider === 'mailgun' && !domain) {
        return fail(
          t({
            en: 'Enter your Mailgun sending domain (e.g. mg.example.org)',
            es: 'Ingrese su dominio de envío de Mailgun (p. ej. mg.example.org)',
            fr: "Entrez votre domaine d'envoi Mailgun (p. ex. mg.example.org)"
          })
        );
      }
      // SES signs each request with the access key ID and region, so both are required.
      if (values.provider === 'ses' && !awsRegion) {
        return fail(
          t({
            en: 'Enter your AWS region (e.g. us-east-1)',
            es: 'Ingrese su región de AWS (p. ej. us-east-1)',
            fr: 'Entrez votre région AWS (p. ex. us-east-1)'
          })
        );
      }
      if (values.provider === 'ses' && !awsAccessKeyId) {
        return fail(
          t({
            en: 'Enter your AWS access key ID',
            es: 'Ingrese su ID de clave de acceso de AWS',
            fr: "Entrez votre identifiant de clé d'accès AWS"
          })
        );
      }
    } else {
      if (!host || !/^[a-zA-Z0-9.-]+$/.test(host) || (!host.includes('.') && host !== 'localhost')) {
        return fail(
          t({
            en: 'Enter a valid host (e.g. smtp.example.org)',
            es: 'Ingrese un host válido (p. ej. smtp.example.org)',
            fr: 'Entrez un hôte valide (p. ex. smtp.example.org)'
          })
        );
      }
      if (!values.port.trim() || !Number.isInteger(port) || port < 1 || port > 65535) {
        return fail(
          t({
            en: 'Port must be a whole number between 1 and 65535',
            es: 'El puerto debe ser un número entero entre 1 y 65535',
            fr: 'Le port doit être un nombre entier entre 1 et 65535'
          })
        );
      }
      if (!username) {
        return fail(
          t({
            en: 'Username is required',
            es: 'El nombre de usuario es obligatorio',
            fr: "Le nom d'utilisateur est requis"
          })
        );
      }
    }
    // A secret is required the first time (when none is stored yet); afterwards the masked
    // value may be left as-is to keep the stored one.
    const secretValue = isHttp ? values.apiKey : values.password;
    const secretStored = isHttp ? config?.hasApiKey : config?.hasPassword;
    if (!secretStored && (!secretValue || secretValue === MASKED_SECRET)) {
      return fail(
        isHttp
          ? t({ en: 'An API key is required', es: 'Se requiere una clave API', fr: 'Une clé API est requise' })
          : t({ en: 'A password is required', es: 'Se requiere una contraseña', fr: 'Un mot de passe est requis' })
      );
    }
    if (!senderAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderAddress)) {
      return fail(
        t({
          en: 'Enter a valid sender address (e.g. noreply@example.org)',
          es: 'Ingrese una dirección de remitente válida (p. ej. noreply@example.org)',
          fr: "Entrez une adresse d'expéditeur valide (p. ex. noreply@example.org)"
        })
      );
    }

    const candidate = {
      awsAccessKeyId,
      awsRegion,
      domain,
      enabled: values.enabled,
      encryption: values.encryption,
      host,
      port: Number.isInteger(port) && port > 0 ? port : 587,
      provider: values.provider,
      region: values.region,
      senderAddress,
      senderName: values.senderName.trim() || undefined,
      transport: values.transport,
      username,
      // Only send a secret when it has actually been changed from the stored (masked) one.
      ...(values.password && values.password !== MASKED_SECRET ? { password: values.password } : {}),
      ...(values.apiKey && values.apiKey !== MASKED_SECRET ? { apiKey: values.apiKey } : {})
    };
    const parsed = $UpdateMailConfigData.safeParse(candidate);
    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ??
          t({ en: 'Please check the fields', es: 'Por favor verifique los campos', fr: 'Veuillez vérifier les champs' })
      );
    }
    return parsed.data;
  };

  const handleToggleEnabled = (checked: boolean) => {
    set('enabled', checked);
    // Persist a disable immediately so the rest of the app reflects it. Enabling for the
    // first time only reveals the form — saving a valid configuration is what turns it on.
    if (!checked && config) {
      updateMutation.mutate({ config: toEnabledPayload(config, false) });
    }
  };

  // Autosave the SMTP configuration whenever the form settles on a valid state.
  useAutosave(JSON.stringify(values), () => {
    const cfg = buildConfig(true);
    if (cfg) {
      updateMutation.mutate({ config: cfg });
    }
  });

  const cleanLocalized = (obj: LocalizedString): LocalizedString => {
    const filtered = Object.fromEntries(Object.entries(obj).filter(([, v]) => v));
    return $LocalizedString.parse(filtered);
  };

  // Autosave the new-user template only when both languages are complete and include the
  // required variables, so we never store a template that can't deliver credentials.
  useAutosave(JSON.stringify(template), () => {
    if (newUserTemplateIssue(template.subject, template.body) === null) {
      updateMutation.mutate({
        newUserEmailTemplate: {
          body: cleanLocalized(template.body),
          subject: cleanLocalized(template.subject)
        }
      });
    }
  });

  // Drive the floating status: "saving" while a save runs, then "saved" for a moment.
  const [saveState, setSaveState] = React.useState<'idle' | 'saved' | 'saving'>('idle');
  const wasPendingRef = React.useRef(false);
  React.useEffect(() => {
    if (updateMutation.isPending) {
      wasPendingRef.current = true;
      setSaveState('saving');
      return undefined;
    }
    if (!wasPendingRef.current) {
      return undefined;
    }
    wasPendingRef.current = false;
    setSaveState('saved');
    const timer = setTimeout(() => setSaveState('idle'), 2500);
    return () => clearTimeout(timer);
  }, [updateMutation.isPending]);

  const runTest = (withRecipient: boolean) => {
    const cfg = buildConfig();
    if (!cfg) {
      return;
    }
    if (withRecipient && !isValidEmail(recipient)) {
      addNotification({
        message: t({
          en: 'Enter a valid recipient email address',
          es: 'Ingrese una dirección de correo electrónico de destinatario válida',
          fr: 'Entrez une adresse courriel de destinataire valide'
        }),
        title: t({ en: 'Invalid email', es: 'Correo electrónico inválido', fr: 'Courriel invalide' }),
        type: 'error'
      });
      return;
    }
    setTestingMode(withRecipient ? 'email' : 'connection');
    addNotification({
      message: withRecipient
        ? t({
            en: 'Sending a test email… this can take a few seconds.',
            es: 'Enviando un correo de prueba… esto puede tardar unos segundos.',
            fr: "Envoi d'un courriel de test… cela peut prendre quelques secondes."
          })
        : t({
            en: 'Testing the connection… this can take a few seconds.',
            es: 'Probando la conexión… esto puede tardar unos segundos.',
            fr: 'Test de la connexion… cela peut prendre quelques secondes.'
          }),
      title: t({ en: 'Please wait', es: 'Por favor espere', fr: 'Veuillez patienter' }),
      type: 'info'
    });
    testMutation.mutate(
      { config: cfg, recipient: withRecipient && recipient ? recipient : undefined },
      {
        onError: () => {
          addNotification({
            message: t({
              en: 'The test could not be completed (the server may be unreachable or the request timed out). Check the host, port, and credentials.',
              es: 'No se pudo completar la prueba (el servidor puede ser inaccesible o la solicitud expiró). Verifique el host, el puerto y las credenciales.',
              fr: "Le test n'a pas pu être effectué (serveur injoignable ou délai dépassé). Vérifiez l'hôte, le port et les identifiants."
            }),
            title: t({ en: 'Mail test failed', es: 'Prueba de correo fallida', fr: 'Échec du test de courriel' }),
            type: 'error'
          });
        },
        onSettled: () => setTestingMode(null),
        onSuccess: (result) => {
          if (result.success) {
            addNotification({
              message: withRecipient
                ? t({
                    en: `Test email sent to ${recipient}`,
                    es: `Correo de prueba enviado a ${recipient}`,
                    fr: `Courriel de test envoyé à ${recipient}`
                  })
                : t({
                    en: 'Connected to the mail server successfully',
                    es: 'Conexión al servidor de correo exitosa',
                    fr: 'Connexion au serveur de courriel réussie'
                  }),
              title: t({ en: 'Mail test succeeded', es: 'Prueba de correo exitosa', fr: 'Test de courriel réussi' }),
              type: 'success'
            });
          } else {
            addNotification({
              message: result.error ?? t({ en: 'Unknown error', es: 'Error desconocido', fr: 'Erreur inconnue' }),
              title: t({ en: 'Mail test failed', es: 'Prueba de correo fallida', fr: 'Échec du test de courriel' }),
              type: 'error'
            });
          }
        }
      }
    );
  };

  const isHttp = values.transport === 'http';
  // Providers name their secret differently, so label the HTTP secret field accordingly.
  const secretLabel =
    values.provider === 'ses'
      ? t({ en: 'AWS secret access key', es: 'Clave de acceso secreta de AWS', fr: "Clé d'accès secrète AWS" })
      : values.provider === 'postmark'
        ? t({ en: 'Server API token', es: 'Token API del servidor', fr: 'Jeton API du serveur' })
        : t({ en: 'API key', es: 'Clave API', fr: 'Clé API' });

  // We never persist `enabled: true` without a working configuration, so when email is enabled
  // but the form isn't valid yet nothing is saved. Surface that so the toggle doesn't look broken.
  const isConfigComplete = buildConfig(true) !== null;

  const templateLangs = MAIL_LANGUAGE.filter((k) => template.body[k] != null);

  const newUserTemplateError = (() => {
    const issue = newUserTemplateIssue(template.subject, template.body, templateLangs);
    if (issue === 'incomplete') {
      return t({
        en: 'Fill in the subject and body for each added language.',
        es: 'Complete el asunto y el cuerpo para cada idioma agregado.',
        fr: "Remplissez l'objet et le corps pour chaque langue ajoutée."
      });
    }
    if (issue === 'missing-vars') {
      return t({
        en: 'The body must include {{username}} and {{password}}.',
        es: 'El cuerpo debe incluir {{username}} y {{password}}.',
        fr: 'Le corps doit inclure {{username}} et {{password}}.'
      });
    }
    return undefined;
  })();

  return (
    <React.Fragment>
      <SaveStatus state={saveState} />
      <SectionCard>
        <Heading className="mb-1" variant="h4">
          {t({ en: 'Email', es: 'Correo electrónico', fr: 'Courriel' })}
        </Heading>
        <p className="text-muted-foreground mb-4 text-sm">
          {t({
            en: 'Turn outgoing email on to configure your mail server and templates. When off, the application behaves as if email is not available. Changes on this page are saved automatically.',
            es: 'Active el envío de correos electrónicos para configurar su servidor de correo y plantillas. Cuando está desactivado, la aplicación se comporta como si el correo no estuviera disponible. Los cambios en esta página se guardan automáticamente.',
            fr: "Activez l'envoi de courriels pour configurer votre serveur de messagerie et vos modèles. Lorsque c'est désactivé, l'application se comporte comme si le courriel n'était pas disponible. Les modifications de cette page sont enregistrées automatiquement."
          })}
        </p>
        <label className="flex items-center gap-2" htmlFor="mail-enabled">
          <Checkbox
            checked={values.enabled}
            id="mail-enabled"
            onCheckedChange={(checked) => handleToggleEnabled(checked === true)}
          />
          <span className="text-sm font-medium">
            {t({
              en: 'Enable email sending',
              es: 'Activar el envío de correos electrónicos',
              fr: "Activer l'envoi de courriels"
            })}
          </span>
        </label>
        {values.enabled && !isConfigComplete && (
          <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-500">
            {t({
              en: 'Complete the configuration below to turn email on — your settings save automatically as you go, so there is no separate save button.',
              es: 'Complete la configuración a continuación para activar el correo electrónico — sus ajustes se guardan automáticamente a medida que avanza, por lo que no hay un botón de guardar separado.',
              fr: "Complétez la configuration ci-dessous pour activer les courriels — vos paramètres sont enregistrés automatiquement au fur et à mesure, il n'y a donc pas de bouton d'enregistrement distinct."
            })}
          </p>
        )}
      </SectionCard>

      {values.enabled && (
        <React.Fragment>
          <SectionCard>
            <Heading className="mb-1" variant="h4">
              {t({
                en: 'Mail Server Configuration',
                es: 'Configuración del servidor de correo',
                fr: 'Configuration du serveur de courriel'
              })}
            </Heading>
            <p className="text-muted-foreground mb-4 text-sm">
              {t({
                en: "Send email over a classic SMTP connection, or through a provider's HTTP sending API (useful when outbound SMTP ports are blocked).",
                es: 'Envíe correos electrónicos a través de una conexión SMTP clásica o a través de la API de envío HTTP de un proveedor (útil cuando los puertos SMTP salientes están bloqueados).',
                fr: "Envoyez des courriels via une connexion SMTP classique ou via l'API d'envoi HTTP d'un fournisseur (utile lorsque les ports SMTP sortants sont bloqués)."
              })}
            </p>
            {/* Changes autosave; new-password secrets keep the browser from autofilling the admin's login */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>{t({ en: 'Delivery method', es: 'Método de envío', fr: "Méthode d'envoi" })}</Label>
                <SegmentedControl<MailTransport>
                  ariaLabel={t({ en: 'Delivery method', es: 'Método de envío', fr: "Méthode d'envoi" })}
                  className="w-full max-w-md"
                  options={[
                    { label: 'SMTP', value: 'smtp' },
                    { label: t({ en: 'HTTP API', es: 'API HTTP', fr: 'API HTTP' }), value: 'http' }
                  ]}
                  value={values.transport}
                  onChange={(value) => set('transport', value)}
                />
              </div>

              {isHttp ? (
                <React.Fragment>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="mail-provider">{t({ en: 'Provider', es: 'Proveedor', fr: 'Fournisseur' })}</Label>
                    <Select
                      value={values.provider}
                      onValueChange={(value) => set('provider', $MailProvider.parse(value))}
                    >
                      <Select.Trigger className="w-full" id="mail-provider">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="mailgun">Mailgun</Select.Item>
                        <Select.Item value="sendgrid">SendGrid</Select.Item>
                        <Select.Item value="ses">Amazon SES</Select.Item>
                        <Select.Item value="postmark">Postmark</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>

                  {values.provider === 'mailgun' && (
                    <React.Fragment>
                      <Field
                        description={t({
                          en: 'The domain you send from in Mailgun (e.g. mg.example.org) — not the API base URL.',
                          es: 'El dominio desde el que envía en Mailgun (p. ej. mg.example.org) — no la URL base de la API.',
                          fr: "Le domaine d'envoi configuré dans Mailgun (p. ex. mg.example.org) — pas l'URL de base de l'API."
                        })}
                        htmlFor="mail-domain"
                        label={t({ en: 'Sending domain', es: 'Dominio de envío', fr: "Domaine d'envoi" })}
                      >
                        <Input
                          autoComplete="off"
                          id="mail-domain"
                          name="odc-mail-domain"
                          placeholder="mg.example.org"
                          value={values.domain}
                          onChange={(event) => set('domain', event.target.value)}
                        />
                      </Field>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="mail-region">{t({ en: 'Region', es: 'Región', fr: 'Région' })}</Label>
                        <Select
                          value={values.region}
                          onValueChange={(value) => set('region', $MailRegion.parse(value))}
                        >
                          <Select.Trigger className="w-full" id="mail-region">
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="us">{t({ en: 'US', es: 'EE. UU.', fr: 'États-Unis' })}</Select.Item>
                            <Select.Item value="eu">{t({ en: 'EU', es: 'UE', fr: 'Europe' })}</Select.Item>
                          </Select.Content>
                        </Select>
                      </div>
                    </React.Fragment>
                  )}

                  {values.provider === 'ses' && (
                    <React.Fragment>
                      <Field
                        description={t({
                          en: 'The AWS region your SES account sends from (e.g. us-east-1).',
                          es: 'La región de AWS desde la que envía su cuenta SES (p. ej. us-east-1).',
                          fr: 'La région AWS depuis laquelle votre compte SES envoie (p. ex. us-east-1).'
                        })}
                        htmlFor="mail-aws-region"
                        label={t({ en: 'AWS region', es: 'Región de AWS', fr: 'Région AWS' })}
                      >
                        <Input
                          autoComplete="off"
                          id="mail-aws-region"
                          name="odc-mail-aws-region"
                          placeholder="us-east-1"
                          value={values.awsRegion}
                          onChange={(event) => set('awsRegion', event.target.value)}
                        />
                      </Field>

                      <Field
                        htmlFor="mail-aws-access-key-id"
                        label={t({
                          en: 'AWS access key ID',
                          es: 'ID de clave de acceso de AWS',
                          fr: "Identifiant de clé d'accès AWS"
                        })}
                      >
                        <Input
                          autoComplete="off"
                          id="mail-aws-access-key-id"
                          name="odc-mail-aws-access-key-id"
                          placeholder="AKIA…"
                          value={values.awsAccessKeyId}
                          onChange={(event) => set('awsAccessKeyId', event.target.value)}
                        />
                      </Field>
                    </React.Fragment>
                  )}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Field htmlFor="mail-host" label={t({ en: 'Host', es: 'Host', fr: 'Hôte' })}>
                    <Input
                      autoComplete="off"
                      id="mail-host"
                      name="odc-smtp-host"
                      placeholder="smtp.example.org"
                      value={values.host}
                      onChange={(event) => set('host', event.target.value)}
                    />
                  </Field>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="mail-encryption">
                        {t({ en: 'Encryption', es: 'Cifrado', fr: 'Chiffrement' })}
                      </Label>
                      <Tooltip>
                        <Tooltip.Trigger
                          aria-label={t({
                            en: 'About encryption options',
                            es: 'Acerca de las opciones de cifrado',
                            fr: 'À propos des options de chiffrement'
                          })}
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
                              es: 'STARTTLS (puerto predeterminado 587) es el estándar moderno y recomendado para la mayoría de las configuraciones — actualiza una conexión simple a una cifrada y tiene la mejor compatibilidad.',
                              fr: 'STARTTLS (port par défaut 587) est la valeur par défaut moderne et recommandée — elle convertit une connexion en clair en connexion chiffrée et offre la meilleure compatibilité.'
                            })}
                          </span>
                          <span>
                            {t({
                              en: 'SSL/TLS (default port 465) is encrypted from the start, used by some providers and legacy systems. If unsure, choose STARTTLS.',
                              es: 'SSL/TLS (puerto predeterminado 465) está cifrado desde el inicio, utilizado por algunos proveedores y sistemas heredados. En caso de duda, elija STARTTLS.',
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
                      <Select.Trigger className="w-full" id="mail-encryption">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="starttls">STARTTLS</Select.Item>
                        <Select.Item value="ssl">SSL/TLS</Select.Item>
                        <Select.Item value="none">{t({ en: 'None', es: 'Ninguno', fr: 'Aucun' })}</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>

                  <Field
                    description={t({
                      en: `Suggested port for ${values.encryption.toUpperCase()}: ${PORT_DEFAULTS[values.encryption]}`,
                      es: `Puerto sugerido para ${values.encryption.toUpperCase()}: ${PORT_DEFAULTS[values.encryption]}`,
                      fr: `Port suggéré pour ${values.encryption.toUpperCase()} : ${PORT_DEFAULTS[values.encryption]}`
                    })}
                    htmlFor="mail-port"
                    label={t({ en: 'Port', es: 'Puerto', fr: 'Port' })}
                  >
                    <Input
                      autoComplete="off"
                      id="mail-port"
                      name="odc-smtp-port"
                      placeholder={PORT_DEFAULTS[values.encryption]}
                      type="number"
                      value={values.port}
                      onChange={(event) => set('port', event.target.value)}
                    />
                  </Field>

                  <Field
                    htmlFor="mail-username"
                    label={t({ en: 'Username', es: 'Nombre de usuario', fr: "Nom d'utilisateur" })}
                  >
                    <Input
                      autoComplete="off"
                      id="mail-username"
                      name="odc-smtp-username"
                      value={values.username}
                      onChange={(event) => set('username', event.target.value)}
                    />
                  </Field>
                </React.Fragment>
              )}

              {isHttp ? (
                <Field
                  description={
                    config?.hasApiKey
                      ? t({
                          en: 'A secret is set (shown masked). Edit the field to replace it.',
                          es: 'Se ha establecido un secreto (se muestra enmascarado). Edite el campo para reemplazarlo.',
                          fr: 'Un secret est défini (affiché masqué). Modifiez le champ pour le remplacer.'
                        })
                      : undefined
                  }
                  htmlFor="mail-secret"
                  label={secretLabel}
                >
                  <Input
                    data-1p-ignore
                    autoComplete="new-password"
                    data-lpignore="true"
                    id="mail-secret"
                    name="odc-smtp-secret"
                    type="password"
                    value={values.apiKey}
                    onChange={(event) => set('apiKey', event.target.value)}
                  />
                </Field>
              ) : (
                <Field
                  description={
                    config?.hasPassword
                      ? t({
                          en: 'A password is set (shown masked). Edit the field to replace it.',
                          es: 'Se ha establecido una contraseña (se muestra enmascarada). Edite el campo para reemplazarla.',
                          fr: 'Un mot de passe est défini (affiché masqué). Modifiez le champ pour le remplacer.'
                        })
                      : undefined
                  }
                  htmlFor="mail-secret"
                  label={t({ en: 'Password', es: 'Contraseña', fr: 'Mot de passe' })}
                >
                  <Input
                    data-1p-ignore
                    autoComplete="new-password"
                    data-lpignore="true"
                    id="mail-secret"
                    name="odc-smtp-secret"
                    type="password"
                    value={values.password}
                    onChange={(event) => set('password', event.target.value)}
                  />
                </Field>
              )}

              <Field
                htmlFor="mail-sender-name"
                label={t({ en: 'Sender name', es: 'Nombre del remitente', fr: "Nom de l'expéditeur" })}
              >
                <Input
                  autoComplete="off"
                  id="mail-sender-name"
                  name="odc-smtp-sender-name"
                  value={values.senderName}
                  onChange={(event) => set('senderName', event.target.value)}
                />
              </Field>

              <Field
                htmlFor="mail-sender-address"
                label={t({ en: 'Sender address', es: 'Dirección del remitente', fr: "Adresse de l'expéditeur" })}
              >
                <Input
                  autoComplete="off"
                  id="mail-sender-address"
                  name="odc-smtp-sender-address"
                  placeholder="noreply@example.org"
                  value={values.senderAddress}
                  onChange={(event) => set('senderAddress', event.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard>
            <Heading className="mb-5" variant="h4">
              {t({
                en: 'Verify Your Configuration',
                es: 'Verifique su configuración',
                fr: 'Vérifiez votre configuration'
              })}
            </Heading>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-start gap-2">
                <div>
                  <p className="text-sm font-medium">{t({ en: 'Connection', es: 'Conexión', fr: 'Connexion' })}</p>
                  <p className="text-muted-foreground text-xs">
                    {t({
                      en: 'Check that the server accepts the connection and your credentials.',
                      es: 'Verifique que el servidor acepta la conexión y sus credenciales.',
                      fr: 'Vérifiez que le serveur accepte la connexion et vos identifiants.'
                    })}
                  </p>
                </div>
                <Button
                  disabled={testMutation.isPending}
                  type="button"
                  variant="primary"
                  onClick={() => runTest(false)}
                >
                  {testingMode === 'connection' && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  {testingMode === 'connection'
                    ? t({ en: 'Testing…', es: 'Probando…', fr: 'Test en cours…' })
                    : t({ en: 'Test connection', es: 'Probar conexión', fr: 'Tester la connexion' })}
                </Button>
              </div>

              <div className="border-t border-slate-200/60 dark:border-slate-700/60" />

              <div className="flex flex-col items-start gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {t({ en: 'Send test email', es: 'Enviar correo de prueba', fr: 'Envoyer un courriel de test' })}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t({
                      en: 'Deliver a real message to confirm everything works end to end.',
                      es: 'Envíe un mensaje real para confirmar que todo funciona de extremo a extremo.',
                      fr: 'Envoyez un message réel pour confirmer que tout fonctionne de bout en bout.'
                    })}
                  </p>
                </div>
                <Input
                  autoComplete="off"
                  className="sm:max-w-sm"
                  id="mail-test-recipient"
                  name="odc-smtp-test-recipient"
                  placeholder={t({
                    en: 'recipient@example.org',
                    es: 'destinatario@ejemplo.org',
                    fr: 'destinataire@exemple.org'
                  })}
                  type="email"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                />
                <Button
                  disabled={testMutation.isPending || !isValidEmail(recipient)}
                  type="button"
                  variant="primary"
                  onClick={() => runTest(true)}
                >
                  {testingMode === 'email' && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  {testingMode === 'email'
                    ? t({ en: 'Sending…', es: 'Enviando…', fr: 'Envoi en cours…' })
                    : t({ en: 'Send test email', es: 'Enviar correo de prueba', fr: 'Envoyer un courriel de test' })}
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-1 flex items-start justify-between gap-4">
              <Heading variant="h4">
                {t({
                  en: 'New User Email Template',
                  es: 'Plantilla de correo para nuevos usuarios',
                  fr: 'Modèle de courriel pour les nouveaux utilisateurs'
                })}
              </Heading>
              <Button
                className="shrink-0"
                size="sm"
                type="button"
                variant="outline"
                onClick={() =>
                  setTemplate({
                    body: DEFAULT_NEW_USER_EMAIL_TEMPLATE.body,
                    subject: DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject
                  })
                }
              >
                {t({ en: 'Reset', es: 'Restablecer', fr: 'Réinitialiser' })}
              </Button>
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              {t({
                en: 'Sent automatically when a new user with an email address is created. The sender chooses the language.',
                es: 'Se envía automáticamente cuando se crea un nuevo usuario con dirección de correo electrónico. El remitente elige el idioma.',
                fr: "Envoyé automatiquement lors de la création d'un nouvel utilisateur disposant d'une adresse courriel. L'expéditeur choisit la langue."
              })}
            </p>
            {activeLanguages.length > 1 && (
              <p className="mb-6 text-sm font-medium text-amber-600 dark:text-amber-400">
                {t({
                  en: 'Remember to update the template in all active languages, not only the one currently selected.',
                  es: 'Recuerde actualizar la plantilla en todos los idiomas activos, no solo en el seleccionado actualmente.',
                  fr: 'N’oubliez pas de mettre à jour le modèle dans toutes les langues actives, pas seulement celle actuellement sélectionnée.'
                })}
              </p>
            )}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>{t({ en: 'Language', es: 'Idioma', fr: 'Langue' })}</Label>
                <Select value={templateLang} onValueChange={(v) => setTemplateLang($MailLanguage.parse(v))}>
                  <Select.Trigger className="w-[180px] border-sky-700 bg-sky-700 text-white hover:bg-sky-800 dark:border-sky-700 dark:bg-sky-700 dark:text-white dark:hover:bg-sky-800">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      {activeLanguages.map((code) => (
                        <Select.Item key={code} value={code}>
                          {ALL_LANGUAGES[code] ?? code}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select>
              </div>
              <Field htmlFor="template-subject" label={t({ en: 'Subject', es: 'Asunto', fr: 'Objet' })}>
                <Input
                  id="template-subject"
                  value={template.subject[templateLang] ?? ''}
                  onChange={(event) =>
                    setTemplate((prev) => ({
                      ...prev,
                      subject: { ...prev.subject, [templateLang]: event.target.value }
                    }))
                  }
                />
              </Field>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="template-body">{t({ en: 'Body', es: 'Cuerpo', fr: 'Corps' })}</Label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">
                      {t({ en: 'Insert:', es: 'Insertar:', fr: 'Insérer :' })}
                    </span>
                    {NEW_USER_VARS.map((variable) => (
                      <Button
                        className="h-6 px-2 font-mono text-xs"
                        key={variable}
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const tag = `{{${variable}}}`;
                          setTemplate((prev) => {
                            const current = prev.body[templateLang] ?? '';
                            const cursor = bodyCursorRef.current;
                            if (cursor === null) {
                              return {
                                ...prev,
                                body: { ...prev.body, [templateLang]: current.length > 0 ? `${current} ${tag}` : tag }
                              };
                            }
                            const next = current.slice(0, cursor.start) + tag + current.slice(cursor.end);
                            bodyCursorRef.current = {
                              end: cursor.start + tag.length,
                              start: cursor.start + tag.length
                            };
                            return { ...prev, body: { ...prev.body, [templateLang]: next } };
                          });
                        }}
                      >
                        {`{{${variable}}}`}
                      </Button>
                    ))}
                  </div>
                </div>
                <TextArea
                  className="min-h-[15rem]"
                  id="template-body"
                  value={template.body[templateLang] ?? ''}
                  onBlur={(event: React.FocusEvent<HTMLTextAreaElement>) => {
                    bodyCursorRef.current = {
                      end: event.currentTarget.selectionEnd,
                      start: event.currentTarget.selectionStart
                    };
                  }}
                  onChange={(event) =>
                    setTemplate((prev) => ({ ...prev, body: { ...prev.body, [templateLang]: event.target.value } }))
                  }
                />
                {newUserTemplateError && <p className="text-destructive text-xs font-medium">{newUserTemplateError}</p>}
              </div>
            </div>
          </SectionCard>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const RouteComponent = () => {
  const { t } = useTranslation();
  const { data: settings } = useMailSettingsQuery();
  const setupStateQuery = useSetupStateQuery();
  const activeLanguages = setupStateQuery.data.activeLanguages ?? ['en', 'fr'];

  return (
    <div className="w-full">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Mail Server', es: 'Servidor de correo', fr: 'Serveur de courriel' })}
        </Heading>
      </PageHeader>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <MailManager
          activeLanguages={activeLanguages}
          config={settings.config}
          newUserEmailTemplate={settings.newUserEmailTemplate}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/mail')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(mailSettingsQueryOptions())
});
