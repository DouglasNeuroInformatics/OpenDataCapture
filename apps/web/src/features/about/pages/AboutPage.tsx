import { Card, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { useSetupState } from '@/hooks/useSetupState';

import { InfoBlock } from '../components/InfoBlock';
import { useGatewayHealthcheckQuery } from '../hooks/useGatewayHealthcheckQuery';

const translations = {
  branch: {
    en: 'Branch',
    fr: 'Branche'
  },
  buildType: {
    en: 'Build Type',
    fr: 'Type de construction'
  },
  buildTypes: {
    development: {
      en: 'Development',
      fr: 'Développement'
    },
    production: {
      en: 'Production',
      fr: 'Production'
    },
    test: {
      en: 'Test',
      fr: 'Test'
    }
  },
  enabled: {
    en: 'Enabled',
    fr: 'Activé'
  },
  status: {
    en: 'Status',
    fr: 'Statut'
  },
  uptime: {
    en: 'Uptime',
    fr: 'Temps de fonctionnement'
  },
  version: {
    en: 'Version',
    fr: 'Version'
  }
};

export const AboutPage = () => {
  const { resolvedLanguage, t } = useTranslation();
  const setupStateQuery = useSetupState();
  const gatewayHealthcheckQuery = useGatewayHealthcheckQuery({
    enabled: setupStateQuery.data?.isGatewayEnabled === true
  });

  if (!setupStateQuery.data || (setupStateQuery.data.isGatewayEnabled && !gatewayHealthcheckQuery.data)) {
    return <LoadingFallback />;
  }

  const { isGatewayEnabled } = setupStateQuery.data;

  const translateReleaseInfo = (release: ReleaseInfo) => {
    const translatedReleaseInfo = {
      [t(translations.buildType)]: t(translations.buildTypes[release.type]),
      [t(translations.version)]: release.version
    };
    if (release.type !== 'production') {
      translatedReleaseInfo[t(translations.branch)] = release.branch;
      translatedReleaseInfo.Commit = release.commit;
    }
    return translatedReleaseInfo;
  };

  const getTranslatedGatewayInfo = () => {
    const gatewayInfo: { [key: string]: string } = {};
    gatewayInfo[t(translations.enabled)] = isGatewayEnabled ? t('core.yes') : t('core.no');
    if (!isGatewayEnabled) {
      return gatewayInfo;
    }
    const gatewayHealthData = gatewayHealthcheckQuery.data!;
    gatewayInfo[t(translations.status)] = gatewayHealthData.status.toString();
    if (gatewayHealthData.ok) {
      Object.assign(gatewayInfo, translateReleaseInfo(gatewayHealthData.release), {
        [t(translations.uptime)]: gatewayHealthData.uptime
      });
    }
    return gatewayInfo;
  };

  const currentDateString = new Date().toLocaleDateString(resolvedLanguage, {
    dateStyle: 'long'
  });

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Platform Information',
            fr: 'Informations concernant la plateforme'
          })}
        </Heading>
      </PageHeader>
      <Card>
        <Card.Header className="border-b">
          <Card.Title className="text-lg">Open Data Capture</Card.Title>
          <Card.Description>
            {t({
              en: "This page provides technical information that you can share with your platform administrator if you encounter any issues. Don't worry if you don't understand the content; it's intended for technical support.",
              fr: "Cette page fournit des informations techniques que vous pouvez partager avec l'administrateur de votre plateforme si vous rencontrez des problèmes. Ne vous inquiétez pas si vous ne comprenez pas le contenu ; il est destiné à l'assistance technique."
            })}
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6 p-6 text-sm">
          <InfoBlock items={translateReleaseInfo(__RELEASE__)} label={t({ en: 'Web Client', fr: 'Client Web' })} />
          <InfoBlock
            items={{
              ...translateReleaseInfo(setupStateQuery.data.release),
              [t(translations.uptime)]: setupStateQuery.data.uptime.toString()
            }}
            label={t({
              en: 'Core API',
              fr: 'API de base'
            })}
          />
          <InfoBlock
            items={getTranslatedGatewayInfo()}
            label={t({
              en: 'Gateway Service',
              fr: 'Service de passerelle'
            })}
          />
        </Card.Content>
        <Card.Footer className="border-t px-6 py-3">
          <p className="text-muted-foreground text-xs">
            {t({ en: `Generated on ${currentDateString}`, fr: `Généré le ${currentDateString}` })}
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
};
