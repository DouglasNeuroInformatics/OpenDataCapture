import React from 'react';

import { Checkbox, Heading } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $UpdateMailConfigData, isSameMailServer } from '@opendatacapture/schemas/mail';
import type { MailConfigDto, MailTemplate, UpdateMailConfigData } from '@opendatacapture/schemas/mail';

import { SectionCard } from '@/components/SectionCard';
import { useUpdateMailSettingsMutation } from '@/hooks/useUpdateMailSettingsMutation';

import { MailServerForm } from './MailServerForm';
import { NewUserTemplateSection } from './NewUserTemplateSection';
import { TestMailSection } from './TestMailSection';

import type { MailConfigFieldErrors, MailConfigFormValues } from './MailServerForm';

// Shown in the password field when one is already stored. The real value is never sent to the
// client; leaving this mask unchanged keeps the stored secret, editing it sets a new one.
const MASKED_SECRET = '••••••••';

const initialValues = (config: MailConfigDto | null): MailConfigFormValues => ({
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

export type MailSettingsProps = {
  config: MailConfigDto | null;
  newUserEmailTemplate: MailTemplate;
};

export const MailSettings = ({ config, newUserEmailTemplate }: MailSettingsProps) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const updateMutation = useUpdateMailSettingsMutation();

  const [values, setValues] = React.useState<MailConfigFormValues>(() => initialValues(config));
  const [errors, setErrors] = React.useState<MailConfigFieldErrors>({});

  // Per-field copy for the rules `$UpdateMailConfigData` enforces. The schema decides what is
  // invalid; this only decides how to say it, so the two cannot disagree about the rules.
  const errorMessages: MailConfigFieldErrors = {
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
  const buildConfig = (): { errors: MailConfigFieldErrors } | { payload: UpdateMailConfigData } => {
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
    const nextErrors: MailConfigFieldErrors = {};
    // The server only lets a blank password inherit the stored one for the same server, so the
    // password has to be re-entered when there is none yet or when the server identity changes.
    const isServerChanged =
      config !== null && !isSameMailServer(config, { encryption: values.encryption, host, port, username });
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
        const field = issue.path[0] as keyof MailConfigFormValues;
        nextErrors[field] = errorMessages[field] ?? issue.message;
      }
      return { errors: nextErrors };
    }
    if (Object.keys(nextErrors).length > 0) {
      return { errors: nextErrors };
    }
    return { payload: parsed.data };
  };

  const set = <K extends keyof MailConfigFormValues>(key: K, value: MailConfigFormValues[K]) => {
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
    } catch {
      addNotification({
        message: t({
          en: 'Your changes were not saved. Check your connection and try again.',
          fr: "Vos modifications n'ont pas été enregistrées. Vérifiez votre connexion et réessayez."
        }),
        title: t({ en: 'Save failed', fr: "Échec de l'enregistrement" }),
        type: 'error'
      });
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
          <MailServerForm
            errors={errors}
            hasStoredPassword={Boolean(config?.hasPassword)}
            isSaving={updateMutation.isPending}
            values={values}
            onChange={set}
            onSave={() => void handleSaveConfig()}
          />

          <TestMailSection buildConfig={buildConfig} onInvalid={setErrors} />

          <NewUserTemplateSection
            isSaving={updateMutation.isPending}
            template={newUserEmailTemplate}
            onSave={(next) => void save({ newUserEmailTemplate: next })}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
