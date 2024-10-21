import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { PageHeader } from '@/components/PageHeader';

export const AdminSettingsPage = () => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Modify Instance Settings',
            fr: "Modifier les paramètres de l'instance"
          })}
        </Heading>
      </PageHeader>
    </React.Fragment>
  );
};
