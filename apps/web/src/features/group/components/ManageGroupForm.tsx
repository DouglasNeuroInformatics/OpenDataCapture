import React from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type ManageGroupData = z.infer<typeof $ManageGroupData>;
const $ManageGroupData = z.object({
  availableInstruments: z.set(z.string())
});

export type ManageGroupFormProps = {
  onSubmit: (data: ManageGroupData) => void;
};

export const ManageGroupForm = ({ onSubmit }: ManageGroupFormProps) => {
  const { t } = useTranslation('group');
  return (
    <Form
      content={{
        availableInstruments: {
          kind: 'set',
          label: t('manage.availableInstruments'),
          options: {
            a: 'A',
            b: 'B',
            c: 'C'
          },
          variant: 'listbox'
        }
      }}
      validationSchema={$ManageGroupData}
      onSubmit={onSubmit}
    />
  );
};
