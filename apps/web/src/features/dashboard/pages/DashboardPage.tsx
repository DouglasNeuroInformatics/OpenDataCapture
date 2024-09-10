import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { Navigate } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { Summary } from '../components/Summary';

export const DashboardPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation('dashboard');

  if (!currentUser?.ability.can('read', 'Summary')) {
    return <Navigate to="/session/start-session" />;
  }

  let welcome: string;
  if (currentGroup?.type === 'CLINICAL') {
    welcome = t({
      en: 'Overview of Your Clinic',
      fr: "Vue d'ensemble de votre clinique"
    });
  } else if (currentGroup?.type === 'RESEARCH') {
    welcome = t({
      en: 'Overview of Your Research Group',
      fr: "Vue d'ensemble de votre groupe de recherche"
    });
  } else {
    welcome = t({
      en: 'Summary of Application State',
      fr: 'La cliente actuelle'
    });
  }

  return (
    <div className="flex flex-grow flex-col">
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader className="text-center">
        <Heading variant="h2">
          {t({
            en: 'Dashboard',
            fr: 'Tableau de bord'
          })}
        </Heading>
      </PageHeader>
      <section className="flex flex-grow flex-col gap-5">
        <div className="flex w-full flex-col flex-wrap justify-between gap-3 md:flex-row md:items-center">
          <Heading className="whitespace-nowrap" variant="h3">
            {welcome}
          </Heading>
          <GroupSwitcher />
        </div>
        <Summary />
      </section>
    </div>
  );
};
