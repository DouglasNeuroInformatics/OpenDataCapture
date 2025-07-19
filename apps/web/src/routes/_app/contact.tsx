import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';

type ContactFormData = {
  contactReason: 'bug' | 'feedback' | 'other' | 'request';
  message: string;
};

type ContactFormProps = {
  onSubmit: (data: ContactFormData) => void;
};

const ContactForm = ({ onSubmit }: ContactFormProps) => {
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
        message: z.string().min(1)
      })}
      onSubmit={onSubmit}
    />
  );
};

const RouteComponent = () => {
  const { t } = useTranslation('contact');

  const handleSubmit = ({ contactReason, message }: ContactFormData) => {
    const subject = encodeURIComponent(t(`reasons.${contactReason}`).toUpperCase());
    const body = encodeURIComponent(message);
    const emailTemplate = `mailto:${config.meta.contactEmail}?subject=${subject}&body=${body}`;
    window.open(emailTemplate, '_blank');
  };

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('pageTitle')}
        </Heading>
      </PageHeader>
      <ContactForm onSubmit={handleSubmit} />
    </div>
  );
};

export const Route = createFileRoute('/_app/contact')({
  component: RouteComponent
});
