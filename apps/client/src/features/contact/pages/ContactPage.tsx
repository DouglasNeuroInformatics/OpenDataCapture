import React from 'react';

import { Form } from '@douglasneuroinformatics/react-components';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

type ContactFormData = {
  contactReason: 'bug' | 'feedback' | 'request' | 'other';
  message: string;
};

export const ContactPage = () => {
  const { t } = useTranslation();

  const handleSubmit = ({ contactReason, message }: ContactFormData) => {
    const subject = encodeURIComponent(t(`contact.reasons.${contactReason}`).toUpperCase());
    const body = encodeURIComponent(message);
    const emailTemplate = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    window.open(emailTemplate, '_blank');
  };

  return (
    <div>
      <PageHeader title={t('contact.pageTitle')} />
      <Form<ContactFormData>
        content={{
          contactReason: {
            kind: 'options',
            label: 'Reason',
            options: {
              bug: t('contact.reasons.bug'),
              feedback: t('contact.reasons.feedback'),
              request: t('contact.reasons.request'),
              other: t('contact.reasons.other')
            }
          },
          message: {
            kind: 'text',
            label: t('contact.message'),
            variant: 'long'
          }
        }}
        validationSchema={{
          type: 'object',
          properties: {
            contactReason: {
              type: 'string',
              enum: ['bug', 'feedback', 'other', 'request']
            },
            message: {
              type: 'string',
              minLength: 1
            }
          },
          required: ['contactReason'],
          errorMessage: {
            properties: {
              reason: t('form.errors.required')
            }
          }
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ContactPage;
