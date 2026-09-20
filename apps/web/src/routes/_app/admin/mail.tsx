import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { MailSettings } from '@/components/MailSettings';
import { PageHeader } from '@/components/PageHeader';
import { mailSettingsQueryOptions, useMailSettingsQuery } from '@/hooks/useMailSettingsQuery';

const RouteComponent = () => {
  const { t } = useTranslation();
  const { data: settings } = useMailSettingsQuery();

  return (
    <div className="w-full">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Mail Server', es: 'Servidor de correo', fr: 'Serveur de courriel' })}
        </Heading>
      </PageHeader>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" data-testid="mail-settings-page">
        <MailSettings config={settings.config} newUserEmailTemplate={settings.newUserEmailTemplate} />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/mail')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(mailSettingsQueryOptions())
});
