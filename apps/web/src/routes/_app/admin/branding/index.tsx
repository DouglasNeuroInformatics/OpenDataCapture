import { Card, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute, Link } from '@tanstack/react-router';
import { MonitorIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';

const RouteComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Branding', fr: 'Image de marque' })}
        </Heading>
      </PageHeader>
      <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <Link className="group" to="/admin/branding/login-page">
          <Card className="group-hover:border-primary h-full transition-colors">
            <Card.Header>
              <div className="flex items-center gap-3">
                <MonitorIcon className="text-muted-foreground h-5 w-5" />
                <Card.Title>{t({ en: 'Login Page', fr: 'Page de connexion' })}</Card.Title>
              </div>
              <Card.Description>
                {t({
                  en: 'Customize the branding panel, colors, logo, and text shown on the login page.',
                  fr: 'Personnalisez le panneau de marque, les couleurs, le logo et le texte affichés sur la page de connexion.'
                })}
              </Card.Description>
            </Card.Header>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/branding/')({
  component: RouteComponent
});
