import React from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export type ContactFormData = {
  contactReason: 'bug' | 'feedback' | 'other' | 'request';
  message: string;
};

export type ContactFormProps = {
  onSubmit: (data: ContactFormData) => void;
};

export const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const { t } = useTranslation('contact');
  return (
    <Form
      className="mx-auto max-w-3xl"
      content={{
        contactReason: {
          kind: 'string',
          label: t('reason'),
          options: {
            bug: t('reasons.bug'),
            feedback: t('reasons.feedback'),
            other: t('reasons.other'),
            request: t('reasons.request')
          },
          variant: 'select'
        },
        message: {
          kind: 'string',
          label: t('message'),
          variant: 'textarea'
        }
      }}
      validationSchema={z.object({
        contactReason: z.enum(['bug', 'feedback', 'other', 'request']),
        message: z.string()
      })}
      onSubmit={onSubmit}
    />
  );
};
