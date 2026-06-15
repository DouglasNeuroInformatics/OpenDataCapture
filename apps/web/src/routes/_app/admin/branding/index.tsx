import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { Logo } from '@opendatacapture/react-core';
import { createFileRoute, Link } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';

const LoginPagePreview = () => (
  <div className="flex h-20 w-36 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 shadow-sm dark:border-slate-600/80">
    <div
      className="flex w-[55%] flex-col items-center justify-center gap-1.5 p-2"
      style={{ background: 'linear-gradient(to bottom, #0ea5e9, #0c4a6e)' }}
    >
      <Logo className="h-auto w-5" variant="light" />
      <div className="h-1 w-10 rounded-full bg-white/60" />
      <div className="h-0.5 w-7 rounded-full bg-white/40" />
    </div>
    <div className="flex w-[45%] flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-[#0ea5e9]/10 to-[#0c4a6e]/10 p-2 dark:from-[#0ea5e9]/20 dark:to-[#0c4a6e]/20">
      <Logo className="h-auto w-3 opacity-60" variant="auto" />
      <div className="bg-muted-foreground/30 h-0.5 w-6 rounded-full" />
      <div className="border-border bg-muted h-2.5 w-8 rounded-sm border" />
      <div className="border-border bg-muted h-2.5 w-8 rounded-sm border" />
      <div className="h-2 w-6 rounded-sm bg-[#0ea5e9]" />
    </div>
  </div>
);

const RouteComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Branding', fr: 'Image de marque' })}
        </Heading>
      </PageHeader>
      <div className="mx-auto w-full max-w-4xl">
        <Link className="group" to="/admin/branding/login-page">
          <div className="flex items-center gap-5 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-sky-300/60 hover:shadow-xl dark:border-slate-700/60 dark:bg-slate-800/90 dark:hover:border-sky-600/60">
            <LoginPagePreview />
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground font-medium">{t({ en: 'Login Page', fr: 'Page de connexion' })}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t({
                  en: 'Customize the branding panel, colors, logo, and text shown on the login page.',
                  fr: 'Personnalisez le panneau de marque, les couleurs, le logo et le texte affichés sur la page de connexion.'
                })}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/branding/')({
  component: RouteComponent
});
