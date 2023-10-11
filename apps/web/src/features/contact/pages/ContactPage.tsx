import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';

const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL;

type ContactFormData = {
  contactReason: 'bug' | 'feedback' | 'other' | 'request';
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
              other: t('contact.reasons.other'),
              request: t('contact.reasons.request')
            }
          },
          message: {
            kind: 'text',
            label: t('contact.message'),
            variant: 'long'
          }
        }}
        validationSchema={{
          errorMessage: {
            properties: {
              reason: t('form.errors.required')
            }
          },
          properties: {
            contactReason: {
              enum: ['bug', 'feedback', 'other', 'request'],
              type: 'string'
            },
            message: {
              minLength: 1,
              type: 'string'
            }
          },
          required: ['contactReason'],
          type: 'object'
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ContactPage;
