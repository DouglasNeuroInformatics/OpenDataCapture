import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';

import { ContactForm } from '../components/ContactForm';

import type { ContactFormData } from '../components/ContactForm';

export const ContactPage = () => {
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
