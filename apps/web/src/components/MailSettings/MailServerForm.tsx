import { Button, Heading, Input, Select, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $MailEncryption } from '@opendatacapture/schemas/mail';
import type { MailEncryption } from '@opendatacapture/schemas/mail';
import { CircleHelpIcon, Loader2Icon } from 'lucide-react';

import { FormField } from '@/components/FormField';
import { SectionCard } from '@/components/SectionCard';

/** Standard SMTP submission ports per encryption mode, offered as the placeholder. */
const PORT_DEFAULTS = {
  none: '25',
  ssl: '465',
  starttls: '587'
} as const satisfies { [K in MailEncryption]: string };

/**
 * The SMTP form's live values. Ports and secrets are held as strings because an in-progress
 * field is not yet a number and the stored password is shown masked — {@link MailSettings}
 * converts and validates them on save.
 */
export type MailConfigFormValues = {
  enabled: boolean;
  encryption: MailEncryption;
  host: string;
  password: string;
  port: string;
  senderAddress: string;
  senderName: string;
  username: string;
};

export type MailConfigFieldErrors = { [K in keyof MailConfigFormValues]?: string };

export type MailServerFormProps = {
  errors: MailConfigFieldErrors;
  hasStoredPassword: boolean;
  isSaving: boolean;
  onChange: <K extends keyof MailConfigFormValues>(key: K, value: MailConfigFormValues[K]) => void;
  onSave: () => void;
  values: MailConfigFormValues;
};

export const MailServerForm = ({
  errors,
  hasStoredPassword,
  isSaving,
  onChange,
  onSave,
  values
}: MailServerFormProps) => {
  const { t } = useTranslation();

  return (
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
            onChange={(event) => onChange('host', event.target.value)}
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
            onValueChange={(value) => onChange('encryption', $MailEncryption.parse(value))}
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
            onChange={(event) => onChange('port', event.target.value)}
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
            onChange={(event) => onChange('username', event.target.value)}
          />
        </FormField>

        <FormField
          description={
            hasStoredPassword
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
            onChange={(event) => onChange('password', event.target.value)}
          />
        </FormField>

        <FormField htmlFor="mail-sender-name" label={t({ en: 'Sender name', fr: "Nom de l'expéditeur" })}>
          <Input
            autoComplete="off"
            data-testid="mail-sender-name"
            id="mail-sender-name"
            name="odc-smtp-sender-name"
            value={values.senderName}
            onChange={(event) => onChange('senderName', event.target.value)}
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
            onChange={(event) => onChange('senderAddress', event.target.value)}
          />
        </FormField>

        <div>
          <Button data-testid="mail-save-config" disabled={isSaving} type="button" variant="primary" onClick={onSave}>
            {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {t('core.save')}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};
