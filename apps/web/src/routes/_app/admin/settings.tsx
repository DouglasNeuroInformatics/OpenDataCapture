import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { $ApplicationSettingsSearch, ApplicationSettings, SETTINGS_TABS } from '@/components/ApplicationSettings';
import { PageHeader } from '@/components/PageHeader';

const RouteComponent = () => {
  const { t } = useTranslation();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div className="w-full">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Application Settings',
            es: 'Configuración de la aplicación',
            fr: "Paramètres de l'application"
          })}
        </Heading>
      </PageHeader>
      <ApplicationSettings tab={tab} onTabChange={(next) => void navigate({ search: { tab: next }, to: '.' })} />
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/settings')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all(SETTINGS_TABS.map(async (tab) => tab.prefetch?.(context.queryClient)));
  },
  validateSearch: $ApplicationSettingsSearch
});
