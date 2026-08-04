import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { GroupEmailTemplates } from '@/components/GroupEmailTemplates';
import { PageHeader } from '@/components/PageHeader';

const RouteComponent = () => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Email Templates', fr: 'Modèles de courriel' })}
        </Heading>
      </PageHeader>
      <GroupEmailTemplates />
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/group/email-templates')({
  component: RouteComponent
});
