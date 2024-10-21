import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { SetupState, UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import type { Promisable, SetNonNullable } from 'type-fest';
import { z } from 'zod';

export type AppSettingsFormProps = {
  initialValues: SetupState;
  onSubmit: (data: UpdateSetupStateData) => Promisable<any>;
};

export const AppSettingsForm = ({ initialValues, onSubmit }: AppSettingsFormProps) => {
  const { t } = useTranslation();
  return (
    <Form
      className="mx-auto max-w-3xl"
      content={{
        isExperimentalFeaturesEnabled: {
          kind: 'boolean',
          label: t('setup.enableExperimentalFeatures'),
          variant: 'radio'
        }
      }}
      initialValues={initialValues}
      preventResetValuesOnReset={true}
      validationSchema={
        z.object({
          isExperimentalFeaturesEnabled: z.boolean()
        }) satisfies z.ZodType<SetNonNullable<UpdateSetupStateData>>
      }
      onSubmit={(data) => void onSubmit(data)}
    />
  );
};
