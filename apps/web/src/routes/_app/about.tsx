import type React from 'react';
import { useCallback, useRef, useState } from 'react';

import { parseDuration } from '@douglasneuroinformatics/libjs';
import { Card, Heading } from '@douglasneuroinformatics/libui/components';
import { useInterval, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $GatewayHealthcheckResult } from '@opendatacapture/schemas/gateway';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';
import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';

import { PageHeader } from '@/components/PageHeader';
import { setupStateQueryOptions, useSetupStateQuery } from '@/hooks/useSetupStateQuery';

const translations = {
  branch: {
    en: 'Branch',
    fr: 'Branche'
  },
  buildDate: {
    en: 'Build Date',
    fr: 'Date de construction'
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

const loadGatewayHealthcheckData = async () => {
  const response = await axios.get('/v1/gateway/healthcheck');
  return $GatewayHealthcheckResult.parse(response.data);
};

const TimeValue: React.FC<{ value: number }> = ({ value }) => {
  const format = useCallback((uptime: number) => {
    return parseDuration(uptime * 1000).match(
      ({ days, hours, minutes, seconds }) => {
        hours += days * 24;
        return [hours, minutes, seconds].map((value) => (value < 10 ? '0' + value : value)).join(':');
      },
      (err) => {
        console.error(err);
        return 'ERROR';
      }
    );
  }, []);
  const valueRef = useRef<number>(value);

  const [state, setState] = useState(format(value));

  useInterval(() => {
    valueRef.current = valueRef.current + 1;
    setState(format(valueRef.current + 1));
  }, 1000);

  return <span>{state}</span>;
};

const InfoBlock: React.FC<{
  items: {
    [key: string]: string;
  };
  label: string;
}> = ({ items, label }) => {
  return (
    <div>
      <h5 className="mb-1 font-semibold">{label}</h5>
      <ul className="text-muted-foreground grid gap-0.5">
        {Object.entries(items).map(([key, value]) => (
          <li key={key}>
            <span>{key}: </span>
            {value.startsWith('Uptime=') ? <TimeValue value={parseInt(value.slice(7))} /> : <span>{value}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const RouteComponent = () => {
  const { resolvedLanguage, t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const gatewayHealthData = Route.useLoaderData({ select: (match) => match.gatewayHealthData });

  const { isGatewayEnabled } = setupStateQuery.data;

  const translateReleaseInfo = (release: ReleaseInfo) => {
    const translatedReleaseInfo = {
      [t(translations.buildDate)]: new Date(release.buildTime).toLocaleDateString(resolvedLanguage, {
        dateStyle: 'long'
      }),
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
    gatewayInfo[t(translations.status)] = gatewayHealthData!.status.toString();
    if (gatewayHealthData!.ok) {
      Object.assign(gatewayInfo, translateReleaseInfo(gatewayHealthData!.release), {
        [t(translations.uptime)]: `Uptime=${gatewayHealthData!.uptime}`
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
              [t(translations.uptime)]: `Uptime=${setupStateQuery.data.uptime}`
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

export const Route = createFileRoute('/_app/about')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { isGatewayEnabled } = await context.queryClient.ensureQueryData(setupStateQueryOptions());
    return { gatewayHealthData: isGatewayEnabled ? await loadGatewayHealthcheckData() : null };
  }
});
