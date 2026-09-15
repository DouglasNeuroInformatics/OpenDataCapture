import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { GroupEmailTemplates } from '@/components/GroupEmailTemplates';
import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';

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
  beforeLoad: () => {
    if (!config.setup.isGatewayEnabled) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent
});
