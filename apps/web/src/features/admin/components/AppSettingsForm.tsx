import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { SetupState, UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import type { Promisable, SetNonNullable } from 'type-fest';
import { z } from 'zod/v4';

type AppSettingsFormProps = {
  initialValues: SetupState;
  onSubmit: (data: UpdateSetupStateData) => Promisable<any>;
};

export const AppSettingsForm = ({ initialValues, onSubmit }: AppSettingsFormProps) => {
  const { t } = useTranslation();
  return (
    <Form
      className="mx-auto max-w-3xl"
      content={[
        {
          fields: {
            isExperimentalFeaturesEnabled: {
              kind: 'boolean',
              label: t('setup.enableExperimentalFeatures'),
              variant: 'radio'
            }
          },
          title: t({
            en: 'Features',
            fr: 'Fonctionnalités'
          })
        }
      ]}
      initialValues={initialValues}
      preventResetValuesOnReset={true}
      validationSchema={
        z.object({
          customLogoSvg: z.string().optional(),
          isExperimentalFeaturesEnabled: z.boolean()
        }) satisfies z.ZodType<SetNonNullable<UpdateSetupStateData>>
      }
      onSubmit={(data) => void onSubmit(data)}
    />
  );
};
